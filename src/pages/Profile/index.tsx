import React, { useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker';
import { Avatar } from 'react-native-paper';
import { useAuth } from '../../hooks/auth';
import getValidationErrors from '../../util/getValidationErrors';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

import {
  Container,
  Header,
  Title,
  AvatarContainer,
  UserAvatarButton,
  UserAvatar,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, userAvatar, updateUser, signOut } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const OldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const ConfirmPasswordInputRef = useRef<TextInput>(null);

  const handleProfileUpdate = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Name is required'),
          email: Yup.string()
            .required('E-mail is required.')
            .email('Must be a valid e-mail.'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: val => !!val,
            then: Yup.string().min(6),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: val => !!val,
              then: Yup.string().required(),
              otherwise: Yup.string(),
            })
            .oneOf(
              [Yup.ref('password'), undefined],
              'Password confirmation does not match with password',
            ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? { old_password, password, password_confirmation }
            : {}),
        };

        const res = await api.put('profile', formData);

        updateUser(res.data);

        Alert.alert('Profile successfully updated');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        if (err.message && err.message === 'Network Error') {
          Alert.alert(
            'Account creation error',
            'An error occurred while trying to update your infomation, check your network connection',
          );

          return;
        }

        Alert.alert(
          'Profile updating error',
          'An error occurred while trying to update your account, please try again',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Pick an image profile',
        cancelButtonTitle: 'Cancel',
        takePhotoButtonTitle: 'Take new photo',
        chooseFromLibraryButtonTitle: 'Select image from gallery',
      },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert('Error while trying to update your profile image');
          return;
        }

        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: response.uri,
        });

        api.patch('users/avatar', data).then(res => {
          updateUser(res.data);
        });
      },
    );
  }, [updateUser, user.id]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  const userAvatarView = useMemo(() => {
    if (userAvatar) {
      return (
        <UserAvatar
          source={{
            uri: userAvatar,
          }}
        />
      );
    }

    return <Avatar.Text size={186} label={user.name[0]} />;
  }, [user.name, userAvatar]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Container>
            <Header>
              <TouchableOpacity onPress={handleGoBack}>
                <Icon name="chevron-left" size={24} color="#999591" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut}>
                <Icon name="log-out" size={24} color="#FF9000" />
              </TouchableOpacity>
            </Header>

            <AvatarContainer>
              {userAvatarView}
              <UserAvatarButton onPress={handleUpdateAvatar}>
                <Icon name="camera" size={22} color="#312E38" />
              </UserAvatarButton>
            </AvatarContainer>

            <View>
              <Title>My profile</Title>
            </View>

            <Form
              style={{ width: '100%' }}
              ref={formRef}
              onSubmit={handleProfileUpdate}
              initialData={user}
            >
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Name"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />

              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => OldPasswordInputRef.current?.focus()}
              />

              <Input
                ref={OldPasswordInputRef}
                name="old_password"
                icon="lock"
                placeholder="Password"
                secureTextEntry
                containerStyle={{ marginTop: 16 }}
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />

              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="New password"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => ConfirmPasswordInputRef.current?.focus()}
              />

              <Input
                ref={ConfirmPasswordInputRef}
                name="password_confirmation"
                icon="lock"
                placeholder="New password confirmation"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />

              <Button onPress={() => formRef.current?.submitForm()}>
                Confirm changes
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
