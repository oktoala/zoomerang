import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import path from 'path';
import fs, { createReadStream } from 'fs';
import icon from '../../resources/icon.png?asset';
import util from 'node:util';
import { exec } from 'child_process';
import { emailTemplate } from './email';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import { emailTransport } from './nodemailer';
import dayjs from 'dayjs';

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  const execPromise = util.promisify(exec);

  ipcMain.handle('make-video', async (_, chunk: ArrayBuffer, num: number) => {
    // await ffmpeg.load();
    const vidWrite = `video-${num ?? 1}.webm`;
    const output = `videoutput-${num ?? 1}.webm`;
    const output_faster = `output_faster-${num ?? 1}.webm`;
    const vidLoopWrite = `videoLoop-${num ?? 1}.webm`;

    console.log('1');
    const buffer = Buffer.from(chunk);

    const userPath = app.getPath('userData');
    try {
      await execPromise(`rm ${path.join(userPath, `video*${num ?? 1}*`)} `);
      await execPromise(`rm  ${path.join(userPath, `output*${num ?? 1}*`)}`);
    } catch (e) {
      console.log(e);
    }

    const outputPath = path.join(userPath, output);

    const outputFasterPath = path.join(userPath, output_faster);
    const outputTxt = path.join(userPath, `output-${num ?? 1}.txt`);

    const urlVideo = path.join(userPath, vidWrite);
    const urlLoopVideo = path.join(userPath, vidLoopWrite);

    console.log('2');
    await fs.promises.writeFile(urlVideo, buffer);
    console.log('3');
    await fs.promises.writeFile(
      outputTxt,
      `file '${outputFasterPath}'\nfile '${outputFasterPath}'\nfile '${outputFasterPath}'\n`
    );

    // const filter = '[0]reverse[r];[0][r]concat,loop=4:200,setpts=N/24/TB';
    // const filter = '[0]reverse[r];[0][r][0]concat=n=4,setpts=0.5*PTS';
    const filter = '"[0:v]reverse[r];[0:v][r]concat=n=2:v=1[outv]" -map "[outv]"';
    console.log('4');
    // Make the boomerang
    const { stdout: out1, stderr: err1 } = await execPromise(
      `ffmpeg -i ${urlVideo} -filter_complex ${filter} ${outputPath}`
    );
    console.log(out1, err1);

    console.log('5');
    // Make it faster
    const { stdout: out2, stderr: err2 } = await execPromise(
      `ffmpeg -i ${outputPath} -vf "setpts=1/2*PTS" ${outputFasterPath}`
    );
    console.log(out2, err2);

    // Make 3 sequence
    const { stdout: out3, stderr: err3 } = await execPromise(
      `ffmpeg -f concat -safe 0 -i ${outputTxt} -c copy ${urlLoopVideo}`
    );

    console.log(out3, err3);

    // ffmpeg.stdout.on('data', (data) => {
    //   console.log(`stdout: ${data}`);
    // });
    //
    // ffmpeg.stderr.on('data', (data) => {
    //   console.log(`stderr: ${data}`);
    // });
    // ffmpeg.on('error', (err) => console.log(`Error: ${err.message}`));
    // const makan = ffmpeg.on('exit', (code, signal) => {
    //   if (code) console.log(`Process exit with code: ${code}`);
    //   if (signal) console.log(`Process killed with signal ${signal}`);
    //   console.log(`Done ✅`);
    //   return 'makan';
    // });

    const video = await fs.promises.readFile(urlLoopVideo);
    console.log(video);
    return {
      msg: 'Berhasil Ambil Video',
      video
    };
  });

  ipcMain.handle('combine', async () => {
    const pathUserData = app.getPath('userData');
    const nama = dayjs().format('YYYY-MM-DD.HH:mm:ss');
    const pathOutputFinal = path.join(pathUserData, `${nama}.webm`);
    const pathOutputFinalMp4 = path.join(pathUserData, `${nama}.mp4`);

    const pathVidLoop1 = path.join(pathUserData, `videoLoop-1.webm`);
    const pathVidLoop2 = path.join(pathUserData, `videoLoop-2.webm`);

    const { stdout, stderr } = await execPromise(
      `ffmpeg -y -i ${pathVidLoop1} -i ${pathVidLoop2} -filter_complex "[0:v][1:v]vstack=inputs=2:shortest=1[outv]" -map "[outv]" ${pathOutputFinal}`
    );
    console.log(stdout);
    console.log(stderr);

    const isExistPathOutput = await fs.promises.readFile(pathOutputFinal);
    if (!isExistPathOutput) {
      return 'Gagal, File Belum ada';
    }

    // const webm2mp4 = `ffmpeg -y -i ${pathOutputFinal} -c:v copy ${pathOutputFinalMp4}`
    // const option = '-c:v libx264 -profile:v main -vf format=yuv420p -c:a aac -movflags +faststart';
    const webm2mp4 = `ffmpeg -i ${pathOutputFinal} -c:v copy ${pathOutputFinalMp4}`;

    const d = await execPromise(webm2mp4);
    console.log(d.stdout, d.stderr);

    const isExistPathOutputMp4 = await fs.promises.readFile(pathOutputFinalMp4);
    if (!isExistPathOutputMp4) {
      return 'Gagal, File .mp4 Belum ada';
    }

    const mp4 = await fs.promises.readFile(pathOutputFinalMp4);
    // const url = URL.createObjectURL(new Blob([mp4.buffer], { type: 'video/mp4' }));

    return {
      nama,
      path: mp4.buffer
    };
  });

  ipcMain.handle('sendEmail', async (_, nameFile: string, name, email: string) => {
    const pathUserData = app.getPath('userData');
    const pathOutputFinalMp4 = path.join(pathUserData, `${nameFile}.mp4`);
    const message: MailOptions = {
      from: 'noreply@hktekno.com',
      to: email,
      // to: 'adrian.fahmi23@gmail.com',
      subject: 'HK Teknologi Text Generate',
      html: emailTemplate(name),
      attachments: [
        {
          filename: `${name}.mp4`,
          content: createReadStream(pathOutputFinalMp4)
        }
      ]
    };

    await emailTransport.sendMail(message);

    return 'Berhasil Kirim';
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common o re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
