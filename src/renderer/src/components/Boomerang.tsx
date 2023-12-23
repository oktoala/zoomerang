import { useCallback, useEffect, useState } from 'react';
import WebcamVid from './WebcamVid';
import { Toaster, toast } from 'react-hot-toast';
import Spinner from './Spinner';

const Boomerang = () => {
  const [dataUser, setDataUser] = useState({
    name: '',
    email: ''
  });

  const [filename, setFilename] = useState<string>();
  const [pathVid, setPathVid] = useState<string>();
  const [vidUrl1, setVidUrl1] = useState<string>();
  const [vidUrl2, setVidUrl2] = useState<string>();

  const [isBuild, setIsBuild] = useState(false);
  const [isSend, setIsSend] = useState(false);

  const [videoConstraints, setVideoConstraints] = useState({
    width: 720,
    height: 540,
    deviceId: '',
    aspectRatio: 1 / 1,
    facingMode: 'user'
  });

  const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput')),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <>
      <Toaster />
      <div className="flex flex-col justify-center items-center h-1/2 basis-1/3">
        <h3 className="mb-5 text-3xl font-bold">Doublmerang</h3>
        <select
          onChange={(e) => {
            setVideoConstraints((o) => ({
              ...o,
              deviceId: e.target.value
            }));
          }}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
        <form
          onSubmit={async (e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsSend(true);

            const res = await window.electron.ipcRenderer.invoke(
              'sendEmail',
              filename,
              dataUser.name,
              dataUser.email
            );

            setIsSend(false);

            toast(res);
          }}
        >
          <div className="relative z-0 my-6 w-max group">
            <input
              type="name"
              name="name"
              id="name"
              value={dataUser.name}
              disabled={isSend || !vidUrl1 || !vidUrl2}
              onChange={(e) => setDataUser((o) => ({ ...o, name: e.target.value }))}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:border-blue-600 focus:ring-0 focus:outline-none peer dark:focus:border-blue-500"
              placeholder=" "
              required
            />
            <label
              htmlFor="name"
              className="absolute top-3 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-6 dark:text-gray-400 peer-focus:font-medium -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Nama
            </label>
          </div>
          <div className="relative z-0 my-6 w-max group">
            <input
              type="email"
              name="floating_email"
              id="floating_email"
              value={dataUser.email}
              disabled={isSend || !vidUrl1 || !vidUrl2}
              onChange={(e) => setDataUser((o) => ({ ...o, email: e.target.value }))}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:border-blue-600 focus:ring-0 focus:outline-none peer dark:focus:border-blue-500"
              placeholder=" "
              required
            />
            <label
              htmlFor="floating_email"
              className="absolute top-3 text-sm text-gray-500 duration-300 transform scale-75 -translate-y-6 dark:text-gray-400 peer-focus:font-medium -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email address
            </label>
          </div>
          <div className="mb-4 text-gray-600 text-sm italic">{filename}</div>
          <div className="flex items-center">
            <button
              disabled={!filename || isSend || !vidUrl1 || !vidUrl2}
              type="submit"
              className="py-2.5 px-5 mr-3 w-full text-sm font-medium text-center text-white bg-blue-700 rounded-lg sm:w-auto dark:bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:text-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {isSend ? <Spinner /> : 'Submit'}
            </button>
            <button
              onClick={() => {
                setVidUrl1(undefined);
                setVidUrl2(undefined);
                setDataUser({
                  name: '',
                  email: ''
                });
                setFilename(undefined);
              }}
              disabled={!dataUser.name && !dataUser.email && (!vidUrl1 || !vidUrl2)}
              type="reset"
              className="py-2.5 px-5 w-full text-sm font-medium text-center text-white bg-red-700 rounded-lg sm:w-auto dark:bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none disabled:text-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed dark:hover:bg-red-700 dark:focus:ring-red-800"
            >
              Reset
            </button>
            <button
              disabled={!vidUrl1 && !vidUrl2}
              onClick={async () => {
                setIsBuild(true);
                const { name, path } = await window.electron.ipcRenderer.invoke('combine');

                setFilename(name);
                setPathVid(path);
                setIsBuild(false);
              }}
              type="button"
              className="py-2.5 px-5 ml-3 w-full text-sm font-medium text-center text-white bg-yellow-700 rounded-lg sm:w-auto dark:bg-yellow-600 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 focus:outline-none disabled:text-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
            >
              {isBuild ? <Spinner /> : 'Build'}
            </button>
          </div>
        </form>
        <div className="mt-5">{pathVid && <video src={pathVid} />}</div>
      </div>
      <div className="flex flex-col basis-2/3">
        <WebcamVid
          videoConstraints={videoConstraints}
          num={1}
          videoURL={vidUrl1}
          setVideoUrl={setVidUrl1}
        />
        <WebcamVid
          videoConstraints={videoConstraints}
          num={2}
          videoURL={vidUrl2}
          setVideoUrl={setVidUrl2}
        />
      </div>
    </>
  );
};

export default Boomerang;
