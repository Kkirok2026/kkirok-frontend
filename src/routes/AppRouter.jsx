import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import StartPage from "../pages/StartPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import SignupProfilePage from "../pages/SignupProfilePage";
import SignupGoalPage from "../pages/SignupGoalPage";
import HomePage from "../pages/HomePage";
import FoodSearchPage from "../pages/FoodSearchPage";
import FoodDetailPage from "../pages/FoodDetailPage";
import UniversityMealPage from "../pages/UniversityMealPage";
import MealDetailPage from "../pages/MealDetailPage";
import ProfilePage from "../pages/ProfilePage";
import MobileLayout from "../components/layout/MobileLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/profile" element={<SignupProfilePage />} />
          <Route path="/signup/goal" element={<SignupGoalPage />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<FoodSearchPage />} />
          <Route path="/foods/:foodId" element={<FoodDetailPage />} />
          <Route path="/university-meal" element={<UniversityMealPage />} />
          <Route path="/meals/:mealLogId" element={<MealDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileLayout>
    </BrowserRouter>
  );
}