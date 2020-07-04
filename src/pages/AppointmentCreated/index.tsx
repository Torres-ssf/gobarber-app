import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';

import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Container,
  Title,
  Description,
  OKButton,
  OkButtonText,
} from './styles';

interface RouteParams {
  date: number;
}

const AppointmentCreated: React.FC = () => {
  const { navigate } = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  const handleOkPressed = useCallback(() => {
    navigate('Dashboard');
  }, [navigate]);

  const formattedDate = useMemo(() => {
    return format(routeParams.date, "EEEE', 'MMMM dd', 'yyyy 'at' HH:mm");
  }, [routeParams.date]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Appointment created</Title>
      <Description>{formattedDate}</Description>

      <OKButton onPress={handleOkPressed}>
        <OkButtonText>Ok</OkButtonText>
      </OKButton>
    </Container>
  );
};

export default AppointmentCreated;
