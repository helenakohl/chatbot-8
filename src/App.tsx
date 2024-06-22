import { useState } from "react";
import "./App.css";
import { Head } from "@impalajs/react/head";

interface AppProps {
  title: string;
}

export const App: React.FC<React.PropsWithChildren<AppProps>> = ({
  children,
  title,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="../src/assets/BMW.png" type="image/x-icon"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Create your own AI chat bot" />
      </Head>
      {children}
    </>
  );
};
