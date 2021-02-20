import { Flex, IconButton, Text } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";

const Footer = (props) => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      {...props}
    >
    <IconButton 
        variant="ghost"
        aria-label="Call Segun"
        size="lg"
        icon={<FaGithub />}
        isRound
        onClick={() => window.open("https://github.com/IESN-IG/IESN-Scheduler", "_blank") || window.location.replace("https://github.com/IESN-IG/IESN-Scheduler")}
    />
      <Text mb={5} opacity="0.5" textAlign="center">
        Support : me@thibaultclaude.be | Discord : <Text as="strong">tiiBz#1337</Text>
      </Text>
    </Flex>
  );
}

export default Footer;