import { useCallback, useEffect, useRef, useState } from 'react';
import WebcamVid from './WebcamVid';
import { Toaster, toast } from 'react-hot-toast';

const Boomerang = () => {
  const [dataUser, setDataUser] = useState({
    name: '',
    email: ''
  });

  const [vidUrl1, setVidUrl1] = useState<string>();
  const [vidUrl2, setVidUrl2] = useState<string>();

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
          <div className="flex items-center">
            <button
              disabled={isSend || !vidUrl1 || !vidUrl2}
              type="submit"
              className="py-2.5 px-5 mr-3 w-full text-sm font-medium text-center text-white bg-blue-700 rounded-lg sm:w-auto dark:bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:text-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              {isSend ? (
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-200 animate-spin fill-gray-800/40"
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
              ) : (
                'Submit'
              )}
            </button>
            <button
              onClick={() => {
                setVidUrl1(undefined);
                setVidUrl2(undefined);
                setDataUser({
                  name: '',
                  email: ''
                });
              }}
              disabled={!vidUrl1 || !vidUrl2}
              type="button"
              className="py-2.5 px-5 w-full text-sm font-medium text-center text-white bg-red-700 rounded-lg sm:w-auto dark:bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none disabled:text-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed dark:hover:bg-red-700 dark:focus:ring-red-800"
            >
              Reset
            </button>
          </div>
        </form>
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
