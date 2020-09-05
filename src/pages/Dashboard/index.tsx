import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import avatarPlaceholderImage from '../../assets/avatar-placeholder.png';

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
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);

  const { user, signOut } = useAuth();
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

  const { resolveAssetSource } = Image;

  const userAvatar = useMemo(
    () =>
      user.avatar_url
        ? user.avatar_url
        : resolveAssetSource(avatarPlaceholderImage).uri,
    [user, resolveAssetSource],
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Bem vindo,
          {'\n'}
          <UserName>{user.name}</UserName>
        </HeaderTitle>

        <ProfileButton onPress={navigateToProfile}>
          <UseAvatar source={{ uri: userAvatar }} />
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
            <ProviderAvatar
              source={{
                uri: provider.avatar_url
                  ? provider.avatar_url
                  : resolveAssetSource(avatarPlaceholderImage).uri,
              }}
            />
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
