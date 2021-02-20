import '../styles/globals.css';
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme.js"
import Layout from '../components/Layout';
import ToggleThemeButton from '../components/ToogleThemeButton';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ToggleThemeButton />
    </ChakraProvider>)
}

export default MyApp;
