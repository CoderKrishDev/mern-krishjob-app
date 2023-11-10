import main from '../assets/images/main.svg';
import { Link } from 'react-router-dom';
import StyledWrapper from '../assets/wrappers/LandingPage';
import { Logo } from '../components';
import { HiUserAdd } from 'react-icons/hi';
import { BiLogIn } from 'react-icons/bi';
const Landing = () => {
  return (
    <StyledWrapper>
      <nav>
        <Logo />
      </nav>
      <div className="container page">
        {/* info */}
        <div className="info">
          <h1>
            job <span>tracking</span> app
          </h1>
          <p>
            Welcome to{' '}
            <span style={{ color: '#2cb1bc', fontWeight: 'bold' }}>
              KrishJob App
            </span>
            , your go-to platform for job seekers and employers alike! Our job
            tracking app is designed to streamline the job search process,
            making it easier for you to discover, apply, and manage your job
            applications.
          </p>
          <Link to="/register" className="btn register-link">
            <span className="icon register-btn">
              <HiUserAdd />
              Register
            </span>
          </Link>
          <Link to="/login" className="btn">
            <span className="icon register-btn">
              <BiLogIn /> Login / Demo User
            </span>
          </Link>
        </div>
        <img src={main} alt="job hunt" className="img main-img" />
      </div>
    </StyledWrapper>
  );
};

export default Landing;
