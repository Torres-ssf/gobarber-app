import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-paper';
import { API_HOST_ANDROID, APP_ENV } from 'react-native-dotenv';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UseAvatar,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMeta,
  ProviderMetaText,
  ProviderListTitle,
} from './styles';

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);

  const { user, userAvatar, signOut } = useAuth();
  const { navigate } = useNavigation();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get('providers');

        setProviders(res.data);
      } catch (err) {
        if (err.response.status === 401) {
          signOut();
          Alert.alert(
            'Session expired',
            'Your session has expired, please sign in again',
          );
        }

        if (err.message && err.message === 'Network Error') {
          Alert.alert(
            'Account creation error',
            'An error occurred while trying to get providers list, check your network connection',
          );
        }
      }
    };

    fetchProviders();
  }, [signOut]);

  const navigateToProfile = useCallback(() => {
    navigate('Profile');
  }, [navigate]);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      navigate('CreateAppointment', { providerId });
    },
    [navigate],
  );

  const userAvatarView = useMemo(() => {
    if (userAvatar) {
      return <UseAvatar source={{ uri: userAvatar }} />;
    }

    return <Avatar.Text size={48} label={user.name[0]} />;
  }, [user, userAvatar]);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Bem vindo,
          {'\n'}
          <UserName>{user.name}</UserName>
        </HeaderTitle>

        <ProfileButton onPress={navigateToProfile}>
          {userAvatarView}
        </ProfileButton>
      </Header>

      <ProvidersList
        data={providers}
        keyExtractor={provider => provider.id}
        ListHeaderComponent={<ProviderListTitle>Barbers</ProviderListTitle>}
        renderItem={({ item: provider }) => (
          <ProviderContainer
            onPress={() => navigateToCreateAppointment(provider.id)}
          >
            {provider.avatar_url ? (
              <ProviderAvatar
                source={{
                  uri:
                    APP_ENV === 'prod' || Platform.OS === 'ios'
                      ? provider.avatar_url
                      : `${API_HOST_ANDROID}/files/${provider.avatar}`,
                }}
              />
            ) : (
              <Avatar.Text size={72} label={provider.name[0]} />
            )}

            <ProviderInfo>
              <ProviderName>{provider.name}</ProviderName>

              <ProviderMeta>
                <Icon name="calendar" size={14} color="#ff9000" />
                <ProviderMetaText>From Monday through Friday</ProviderMetaText>
              </ProviderMeta>

              <ProviderMeta>
                <Icon name="clock" size={14} color="#ff9000" />
                <ProviderMetaText>From 8 through 18</ProviderMetaText>
              </ProviderMeta>
            </ProviderInfo>
          </ProviderContainer>
        )}
      />
    </Container>
  );
};

export default Dashboard;
