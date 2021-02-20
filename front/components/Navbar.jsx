import React, { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Stack,
  Text
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { HamburgerIcon } from "@chakra-ui/icons";
import { FaLifeRing, FaCalendarAlt, FaHome, FaBug } from "react-icons/fa";

const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <NavbarContainer {...props}>
        <MenuToggle toggle={toggle} isOpen={isOpen} />
        <MenuLinks isOpen={isOpen} toggle={toggle} />
      </NavbarContainer>
    </>
  );
};

const MenuToggle = ({ toggle, isOpen }) => {
  return (
    <Flex display={{ base: "block", md: "none" }} onClick={toggle} position="absolute">
      {!isOpen && <HamburgerIcon width={8} height={8} color="gray.300" />}
    </Flex>
  );
};

const MenuButton = ({ url, icon, text, isOpen, toggle }) => {
    const router = useRouter();
    return (
    <Button
    variant="ghost"
    onClick={() => {
    router.push(url);
    isOpen && toggle();
    }}
    leftIcon={icon}
    _hover={{
        backgroundColor: "rgba(255, 255, 255, 0.08)"
    }}>
        <Text>{text}</Text>
  </Button>)
}

const MenuLinks = ({ isOpen, toggle }) => {

  const Links = () => {
    return (
      <Stack
        spacing={8}
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={{ base: "column", md: "row" }}
        pt={[4, 4, 0, 0]}
        height="100%"
      >
        <MenuButton url="/" icon={<FaHome />} text="Accueil" isOpen={isOpen} toggle={toggle} />

        <MenuButton url="/" icon={<FaCalendarAlt />} text="Agenda" isOpen={isOpen} toggle={toggle} />

        <MenuButton url="/" icon={<FaLifeRing />} text="Aide" isOpen={isOpen} toggle={toggle} />

        <MenuButton url="/" icon={<FaBug />} text="Signaler un problème" isOpen={isOpen} toggle={toggle} />

      </Stack>
    );
  };

  if (isOpen) {
    return (
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={toggle}
        motionPreset="slideInRight"
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <Links />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    );
  }

  if (!isOpen) {
    return (
      <Box
        display={{ base: isOpen ? "block" : "none", md: "block" }}
        flexBasis={{ base: "100%", md: "auto" }}
      >
        <Links />
      </Box>
    );
  }
};

const NavbarContainer = ({ children, ...props }) => {
  return (
    <Flex
      as="nav"
      align="center"
      justify={{ base: "flex-end", md: "center" }}
      wrap="wrap"
      width="100%"
      p={5}
      bg="blue.800"
      color="gray.300"
      position="relative"
      boxShadow="xl"
      {...props}
    >
      {children}
    </Flex>
  );
};

export default Navbar;