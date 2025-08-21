import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Foodmap from "./foodmap/foodmap";
import Genre from './Genre/Genre';
import Community from './Community/Community';
import CountryBoard from './Community/CountryBoard';
import TravelPartner from './Community/TravelPartner';
import ReviewRecommend from './Community/ReviewRecommend';
import DiscountTicket from './Community/DiscountTicket';
import PaymentPage from './Community/PaymentPage';
import Recommended from './Genre/Recommended';
import AllPosters from './Genre/AllPosters';
import Main from './MainPage/Main';
import Login from './Login/Login'; 
import Signup from './Signup/Signup';
import ContentDetail from "./ContentDetail/ContentDetail";
import MyTest from './components/MyTest';
import TestResults from './components/TestResults';
import TestDatabase from './components/TestDatabase';
import AITranslation from './components/AITranslation';
import Review from './components/Review';
import EventDetail from './components/EventDetail';



const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/foodmap",
    element: <Foodmap />,
  },
  {
    path: "/genre",
    element: <Genre />,
  },
  {
    path: "/community",
    element: <Community />,
  },
  {
    path: "/community/country-board",
    element: <CountryBoard />,
  },
  {
    path: "/community/travel-partner",
    element: <TravelPartner />,
  },
  {
    path: "/community/review-recommend",
    element: <ReviewRecommend />,
  },
  {
    path: "/community/discount-ticket",
    element: <DiscountTicket />,
  },
  {
    path: "/community/payment",
    element: <PaymentPage />,
  },
  {
    path: "/genre/recommended",
    element: <Recommended />,
  },
  {
    path: "/genre/all",
    element: <AllPosters />,
  },
    {
    path: "/login", 
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/content/:id", element: <ContentDetail />
  },
  {
    path: "/test/my-test",
    element: <MyTest />
  },
                  {
          path: "/test/results",
          element: <TestResults />
        },
        {
          path: "/test/database",
          element: <TestDatabase />
        },
        {
          path: "/ai-translation",
          element: <AITranslation />
        },
        {
          path: "/review",
          element: <Review />
        },
        {
          path: "/event/:id",
          element: <EventDetail />
        }
  

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
