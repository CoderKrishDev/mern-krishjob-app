import Wrapper from '../assets/wrappers/About';
import canva from '../assets/images/canva.svg';
const About = () => {
  return (
    <Wrapper>
      <img src={canva} alt="my about" height="100%" width="100%" />
    </Wrapper>
  );
};

export default About;
