import { useColorMode, useColorModeValue, IconButton } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

const ToggleThemeButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.400", "gray.700");

  return (
    <IconButton
      zIndex="50"
      position="fixed"
      right={{ base: "2vh", md: "2vh", lg: "3vh" }}
      bottom={{ base: "3vh", md: "2vh", lg: "2vh" }}
      bg={bg}
      isRound
      onClick={toggleColorMode}
      size="lg"
      icon={
        colorMode === "light" ? <MoonIcon /> : <SunIcon color="yellow.400" />
      }
    />
  );
}

export default ToggleThemeButton;
