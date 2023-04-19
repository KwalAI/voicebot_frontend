import { useState } from "react";
import "@fontsource/inter";
import "./App.css";

import {
  Container,
  Box,
  ChakraProvider,
  Flex,
  Text,
  VStack,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Button
} from "@chakra-ui/react";
import Conversation from "./components/Conversation";

import { isChrome, isMobile, isSafari } from "react-device-detect";
import { WarningIcon } from "@chakra-ui/icons";
import {
  DeepgramTranscriberConfig,
  LLMAgentConfig,
  AzureSynthesizerConfig,
  VocodeConfig,
  EchoAgentConfig,
  ChatGPTAgentConfig,
  RESTfulUserImplementedAgentConfig,
  WebSocketUserImplementedAgentConfig,
} from "vocode";

const App = () => {
  const transcriberConfig: Omit<
    DeepgramTranscriberConfig,
    "samplingRate" | "audioEncoding"
  > = {
    type: "transcriber_deepgram",
    chunkSize: 2048,
    endpointingConfig: {
      type: "endpointing_punctuation_based",
    },
  };
  const agentConfig: ChatGPTAgentConfig = {
    type: "agent_chat_gpt",
    initialMessage: { type: "message_base", text: "Hello!" },
    promptPreamble:
      "Vocode is an SDK that allows developers to create voice bots like this one in less than 10 lines of code. The AI is explaining to the human what Vocode is.",
    endConversationOnGoodbye: true,
    generateResponses: true,
    cutOffResponse: {},
  };
  const synthesizerConfig: Omit<
    AzureSynthesizerConfig,
    "samplingRate" | "audioEncoding"
  > = {
    type: "synthesizer_azure",
    shouldEncodeAsWav: true,
    voiceName: "en-US-SteffanNeural",
  };
  const vocodeConfig: VocodeConfig = {
    apiKey: process.env.REACT_APP_VOCODE_API_KEY || "",
  };

  const [linkedinProfile, setLinkedinProfile] = useState<string>('');

  return (
    <ChakraProvider>
      {(isMobile || !isChrome) && !isSafari ? (
        <VStack padding={10} alignItems="center">
          <WarningIcon boxSize={100} />
          <Text paddingTop={4}>
            This demo works on: Chrome (desktop) and Safari (desktop, mobile)
            only!
          </Text>
        </VStack>
      ) : (
        <>
          {
            linkedinProfile ? <Conversation
              linkedinProfile={linkedinProfile}
              config={{
                transcriberConfig,
                agentConfig,
                synthesizerConfig,
                vocodeConfig,
              }}
            /> : (
              <Container>
                <Flex style={{ "color": "black" }} h="100vh" color='white' justify="center" align="center">
                  <Box p="2" >
                    <InputForm
                      linkedinProfile={linkedinProfile}
                      setLinkedinProfile={setLinkedinProfile}
                    />
                  </Box>
                </Flex>
              </Container>
            )
          }
        </>
      )}
    </ChakraProvider>
  );
};

function InputForm(props: any) {
  const [link, setLink] = useState<string>('')
  const [error, setError] = useState<boolean>(false)
  const handleInputChange = (e: any) => setLink(e.target.value)

  const handleSubmit = () => {
    if (link !== '') {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept':'application/json'},
        body: JSON.stringify({ link: link })
      };
      fetch('http://0.0.0.0/profile', requestOptions)
        .then(response => response.json())
        .then(data => {
          props.setLinkedinProfile(link)
        });
    } else {
      setError(true)
    }
  }

  return (
    <FormControl isInvalid={error}>
      <FormLabel>LinkedIn Profile</FormLabel>
      <Input type='text' value={link} onChange={handleInputChange} />
      {error && <FormErrorMessage>LinkedIn Profile is required.</FormErrorMessage>}
      <Button
        mt={4}
        colorScheme='teal'
        onClick={handleSubmit}
        size="sm"
        type='submit'
      >
        Submit
      </Button>
    </FormControl>
  )
}

export default App;
