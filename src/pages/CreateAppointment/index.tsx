import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';
import { Avatar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Platform, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { API_HOST_ANDROID, APP_ENV } from 'react-native-dotenv';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersList,
  ProvidersListContainer,
  ProviderName,
  ProviderAvatar,
  ProviderContainer,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  avatar_url: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const route = useRoute();
  const routeParams = route.params as RouteParams;

  const [providers, setProviders] = useState<Provider[]>([]);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );

  const { user, userAvatar, signOut } = useAuth();
  const { goBack, reset } = useNavigation();

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

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

  useEffect(() => {
    const fetchDailyDate = async () => {
      try {
        const res = await api.get(
          `providers/${selectedProvider}/day-availability`,
          {
            params: {
              year: selectedDate.getFullYear(),
              month: selectedDate.getMonth() + 1,
              day: selectedDate.getDate(),
            },
          },
        );

        setAvailability(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDailyDate();
  }, [selectedDate, selectedProvider, signOut]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker(oldState => !oldState);
  }, []);

  const handleDateChange = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppoinment = useCallback(async () => {
    if (selectedHour === 0) {
      Alert.alert(
        'Select time slot',
        'Please select an available time slot to create an appointment',
      );

      return;
    }
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', { provider_id: selectedProvider, date });

      reset({
        routes: [
          { name: 'Dashboard' },
          { name: 'AppointmentCreated', params: { date: date.getTime() } },
        ],
        index: 1,
      });
    } catch (err) {
      Alert.alert(
        'Error while creating appointment',
        'An error has occurred while trying to create a new appointment, please try again',
      );
    }
  }, [selectedDate, selectedHour, selectedProvider, reset]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => ({
        hour,
        available,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
      }));
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => ({
        hour,
        available,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
      }));
  }, [availability]);

  const userAvatarView = useMemo(() => {
    if (userAvatar) {
      return (
        <UserAvatar
          source={{
            uri:
              APP_ENV === 'prod' || Platform.OS === 'ios'
                ? userAvatar
                : `${API_HOST_ANDROID}/files/${user.avatar}`,
          }}
        />
      );
    }

    return <Avatar.Text size={48} label={user.name[0]} />;
  }, [user, userAvatar]);

  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Barbers</HeaderTitle>
        {userAvatarView}
      </Header>

      <ScrollView keyboardShouldPersistTaps="handled">
        <Content>
          <ProvidersListContainer>
            <ProvidersList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={providers}
              keyExtractor={provider => provider.id}
              renderItem={({ item: provider }) => (
                <ProviderContainer
                  onPress={() => handleSelectProvider(provider.id)}
                  selected={provider.id === selectedProvider}
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
                    <Avatar.Text size={32} label={provider.name[0]} />
                  )}
                  <ProviderName selected={provider.id === selectedProvider}>
                    {provider.name}
                  </ProviderName>
                </ProviderContainer>
              )}
            />
          </ProvidersListContainer>

          <Calendar>
            <Title>Pick a date</Title>

            <OpenDatePickerButton onPress={handleToggleDatePicker}>
              <OpenDatePickerButtonText>Select date</OpenDatePickerButtonText>
            </OpenDatePickerButton>

            {showDatePicker && (
              <DateTimePicker
                is24Hour
                display="calendar"
                mode="date"
                onChange={handleDateChange}
                textColor="#f4ede8"
                value={selectedDate}
              />
            )}
          </Calendar>

          <Schedule>
            <Title>Pick an hour</Title>

            <Section>
              <SectionTitle>Morning</SectionTitle>

              <SectionContent horizontal>
                {morningAvailability.map(
                  ({ available, hour, hourFormatted }) => (
                    <Hour
                      selected={selectedHour === hour}
                      available={available}
                      enabled={available}
                      onPress={() => {
                        handleSelectHour(hour);
                      }}
                      key={hourFormatted}
                    >
                      <HourText selected={selectedHour === hour}>
                        {hourFormatted}
                      </HourText>
                    </Hour>
                  ),
                )}
              </SectionContent>
            </Section>
            <Section>
              <SectionTitle>Afternoon</SectionTitle>

              <SectionContent horizontal>
                {afternoonAvailability.map(
                  ({ available, hour, hourFormatted }) => (
                    <Hour
                      enabled={available}
                      selected={selectedHour === hour}
                      onPress={() => {
                        handleSelectHour(hour);
                      }}
                      available={available}
                      key={hourFormatted}
                    >
                      <HourText selected={selectedHour === hour}>
                        {hourFormatted}
                      </HourText>
                    </Hour>
                  ),
                )}
              </SectionContent>
            </Section>
          </Schedule>
          <CreateAppointmentButton onPress={handleCreateAppoinment}>
            <CreateAppointmentButtonText>
              Create Appointment
            </CreateAppointmentButtonText>
          </CreateAppointmentButton>
        </Content>
      </ScrollView>
    </Container>
  );
};

export default CreateAppointment;
