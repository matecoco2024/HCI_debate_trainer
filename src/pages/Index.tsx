
import React from 'react';
import { UserProvider } from '../contexts/UserContext';
import MainMenu from '../components/MainMenu';

const Index = () => {
  return (
    <UserProvider>
      <MainMenu />
    </UserProvider>
  );
};

export default Index;
