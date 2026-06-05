import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import GetStarted from './components/GetStarted';
import Signup from './components/Signup';
import Signin from './components/Signin';
import CustomerHome from './components/CustomerHome';
import Slots from './components/Slots';
import ServiceProviderHome from './components/ServiceProviderHome';
import AddSlots from './components/AddSlots';
import MyBooking from './components/MyBookings';
import AddReview from './components/AddReview';
import { Navigate } from 'react-router-dom';
import Header from './components/Header';
import Profile from './components/Profile';
import Chat from './components/Chat';
import ChatList from './components/ChatList';
import BookingRequests from './components/BookingRequests';
import ServiceOfferings from './components/ServiceOfferings';
import WorkPhotos from './components/WorkPhotos';

const RootRedirect = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"; // boolean
  const type = localStorage.getItem("userType");

  if (!isAuthenticated) {
    return <GetStarted />;
  }

  return type === 'service-provider' ? <Navigate to="/ServiceProviderHome" /> : <Navigate to="/home" />;
}

function App() {
  return (
    <Router>
      <div className='w-full h-full'>
        <Header />
        <Routes>
          <Route path='/' element={<RootRedirect />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/home' element={<CustomerHome />} />
          <Route path='/ServiceProviderHome' element={<ServiceProviderHome />} />
          <Route path='/slots/:id' element={<Slots />} />
          <Route path='/add-slots' element={<AddSlots />} />
          <Route path='/bookings' element={<MyBooking />} />
          <Route path='/review/:id' element={<AddReview />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/messages' element={<ChatList />} />
          <Route path='/chat/:conversationId' element={<Chat />} />
          <Route path='/chat/:otherUserId' element={<Chat />} />
          <Route path='/booking-requests' element={<BookingRequests />} />
          <Route path='/my-services' element={<ServiceOfferings />} />
          <Route path='/work-photos' element={<WorkPhotos />} />
        </Routes>
      </div>
    </Router>
  )
}
export default App;
