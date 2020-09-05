import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px ${Platform.OS === 'android' ? 30 : 40}px;
  position: relative;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0 24px;
`;

export const BackButton = styled.TouchableOpacity`
  margin-top: 40px;
`;

export const AvatarContainer = styled.View`
  margin-top: 24px;
  position: relative;
  width: 186px;
  height: 186px;
  border-radius: 98px;
  align-self: center;
`;

export const UserAvatarButton = styled.TouchableOpacity`
  border-radius: 25px;
  position: absolute;
  height: 50px;
  width: 50px;
  bottom: 0;
  right: 0;
  justify-content: center;
  align-items: center;
  background: #ff9000;
`;

export const UserAvatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 98px;
  align-self: center;
`;
