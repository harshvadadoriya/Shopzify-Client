import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../formik/FormikControl";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { UserLoginAuthFormValues } from "../../../interfaces/interface";
import { NavLink, useNavigate } from "react-router-dom";
import { AiFillShop } from "react-icons/ai";
import { useAppDispatch } from "../../../redux/store";
import { setLoggedIn } from "../../../redux/authSliceRedux/authSlice";
import { useLoginMutation } from "../../../redux/apiSliceRedux/apiSlice";

const Login = () => {
  const toast = useToast();
  const submitMenuBgColor = useColorModeValue("teal.400", "teal.600");
  const resetMenuBgColor = useColorModeValue("red.400", "red.600");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const initialValue: UserLoginAuthFormValues = {
    email: "",
    password: "",
  };
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email is invalid")
      .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Email is invalid")
      .required("Email is required"),

    password: Yup.string()
      .min(8, "Password must be 8 characters long")
      .required("Password is required"),
  });

  const [loginUser] = useLoginMutation();

  const onSubmit = async (values: UserLoginAuthFormValues) => {
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      }).unwrap();
      navigate("/");
      dispatch(setLoggedIn(response.accessToken));
    } catch (err: any) {
      if (err.data.message) {
        toast({
          title: err.data.message,
          description: err.data.subMessage,
          position: "top",
          status: "error",
          isClosable: true,
        });
      } else {
        toast({
          title: "oops, please try again!",
          position: "top",
          status: "error",
          isClosable: true,
        });
      }
    }
  };

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      textAlign="center"
      mx="3"
    >
      <Box
        width={"xl"}
        boxShadow="lg"
        padding={6}
        borderWidth="1px"
        borderRadius="lg"
      >
        <Box>
          <Flex fontSize={40} alignItems="center">
            <Text>
              <AiFillShop fontSize={40} fill="teal" />
            </Text>
            <Text fontFamily={"cursive"} color="teal" marginX={1}>
              Shopzify
            </Text>
          </Flex>
          <Text fontSize="2xl" my={4} textColor="gray.600">
            Login to your account
          </Text>
        </Box>
        <Formik
          initialValues={initialValue}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <Form>
              <FormikControl
                control="input"
                type="text"
                label="Email"
                name="email"
                placeholder="Enter your email"
              />

              <FormikControl
                autoComplete="true"
                control="input"
                type="password"
                label="Password"
                name="password"
                placeholder="Enter your password"
              />
              <Box textAlign="left">
                <Button
                  type="submit"
                  colorScheme="teal"
                  color="white"
                  bgColor={submitMenuBgColor}
                  marginY={4}
                  _hover={{
                    bgColor: "teal.500",
                  }}
                >
                  Submit
                </Button>
                <Button
                  type="reset"
                  colorScheme="red"
                  color="white"
                  bgColor={resetMenuBgColor}
                  marginY={4}
                  marginX={2}
                  _hover={{
                    bgColor: "red.500",
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
        <Box className="mt-1">
          <Text>
            Don't have an account yet?
            <NavLink className="ml-2 text-teal-500 font-bold" to="/signup">
              Sign up here
            </NavLink>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
