import React, { useState } from 'react';
import Wrapper from '../assets/wrappers/About';
import canva from '../assets/images/canva.svg';

const About = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <Wrapper>
      {isLoading && <h5>Please Wait Loading...</h5>}
      <img
        src={canva}
        alt="my about"
        height="100%"
        width="100%"
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </Wrapper>
  );
};

export default About;
