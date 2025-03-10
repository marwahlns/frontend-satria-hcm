import "../styles/globals.css";

import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

const GlobalInit = dynamic(() => import("../components/GlobalInit"), {
  ssr: false,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <GlobalInit />
    </>
  );
}
