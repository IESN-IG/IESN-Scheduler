import { Flex } from "@chakra-ui/react";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Navbar minH="8vh" maxH="8vh" />
        <Flex
          width="100%"
          alignItems="center"
          justifyContent="center"
          direction="column"
          position="relative"
          minH="80vh"
          paddingRight="6vw"
          paddingLeft="6vw"
        >
          {children}
        </Flex>
        <Footer minH="12vh" maxH="12vh" />
      </Flex>
    </>
  );
};

export default Layout;
