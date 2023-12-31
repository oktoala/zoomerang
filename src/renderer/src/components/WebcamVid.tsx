import Webcam from 'react-webcam';
import { Dispatch, useCallback, useRef, useState } from 'react';
import { useTimer } from 'react-timer-hook';

const WebcamVid = ({
  videoConstraints,
  num,
  videoURL,
  setVideoUrl
}: {
  videoConstraints?: boolean | MediaTrackConstraints;
  num?: number;
  videoURL?: string;
  setVideoUrl: Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [, setRecordedChunks] = useState<Blob[]>([]);
  const [isMakingLoopVideo, setIsMakingLoopVideo] = useState(false);

  const date = new Date();
  date.setSeconds(date.getSeconds() + 3);

  const makeLoopVideo = async (data: Blob[]) => {
    setIsMakingLoopVideo(true);
    console.log(data);
    const file = new File(data, `video-${num}`);
    const arrBuff = await file.arrayBuffer();
    const res = (await window.electron.ipcRenderer.invoke('make-video', arrBuff, num)) as {
      msg: string;
      video: Buffer;
    };
    console.log(res.msg);
    setVideoUrl(URL.createObjectURL(new Blob([res.video.buffer], { type: 'video/mp4' })));
    setIsMakingLoopVideo(false);
  };

  const { seconds, start, restart } = useTimer({
    autoStart: false,
    expiryTimestamp: date,
    onExpire: useCallback(async () => {
      console.log('Makan');
      // @ts-ignore gerr
      mediaRecorderRef.current.stop();
      setCapturing(false);
    }, [mediaRecorderRef, setCapturing])
  });

  // const [videoURL, setVideoURL] = useState<string>();

  const handleDataAvailable = useCallback(
    async ({ data }: { data: Blob }) => {
      console.log(data);
      if (data.size > 0) {
        await makeLoopVideo([data]);
        setRecordedChunks([data]);
      }
    },
    [setRecordedChunks]
  );

  const handleStartCaptureClick = useCallback(() => {
    start();
    setCapturing(true);
    // @ts-ignore gerr
    mediaRecorderRef.current = new MediaRecorder(webcamRef?.current?.stream, {
      mimeType: 'video/webm'
    });
    // @ts-ignore gerr
    mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    // @ts-ignore gerr
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  return (
    <div className="flex items-center">
      <div className="relative">
        <div
          className={`${
            isMakingLoopVideo ? 'flex' : 'hidden'
          } absolute top-0 z-40 justify-center items-center w-full h-full bg-gray-800/40`}
        >
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-10 h-10 text-gray-200 animate-spin fill-gray-800/40"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
        {videoURL ? (
          <video width={720} height={540} src={videoURL} autoPlay loop />
        ) : (
          <Webcam
            controls={false}
            width={720}
            height={540}
            audio={false}
            ref={webcamRef}
            videoConstraints={videoConstraints}
          />
        )}
      </div>
      <div className="ml-4">
        {capturing && !videoURL && (
          <div className="flex justify-center items-center w-14 h-14 text-xl text-white rounded-full bg-sky-500">
            {seconds}
          </div>
        )}
        {!capturing && !videoURL && !isMakingLoopVideo && (
          <button onClick={handleStartCaptureClick}>
            <svg
              className="fill-sky-500 hover:fill-sky-600"
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              data-darkreader-inline-fill=""
            >
              <path d="M20 5h-2.586l-2.707-2.707A.996.996 0 0 0 14 2h-4a.996.996 0 0 0-.707.293L6.586 5H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zm-8 12c-2.71 0-5-2.29-5-5 0-2.711 2.29-5 5-5s5 2.289 5 5c0 2.71-2.29 5-5 5z"></path>
              <path d="M13 9h-2v2H9v2h2v2h2v-2h2v-2h-2z"></path>
            </svg>
          </button>
        )}
        {videoURL && (
          <button
            onClick={() => {
              setVideoUrl(undefined);
              restart(date);
            }}
          >
            <svg
              className="fill-red-500 hover:fill-red-600"
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              data-darkreader-inline-fill=""
            >
              <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamVid;
