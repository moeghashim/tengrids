import "../styles/globals.css";
import type { AppProps } from "next/app";

import "tengrids/dist/index.css";

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;
