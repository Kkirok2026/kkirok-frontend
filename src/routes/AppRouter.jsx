import { Navigate, Route, Routes } from "react-router-dom";

import StartPage from "../pages/StartPage";
import LoginPage from "../pages/LoginPage";

import SignupVerifyPage from "../pages/SignupVerifyPage";
import SignupCreatePage from "../pages/SignupCreatePage";
import SignupProfilePage from "../pages/SignupProfilePage";
import SignupAllergyPage from "../pages/SignupAllergyPage";
import SignupGoalPage from "../pages/SignupGoalPage";
import SignupLoadingPage from "../pages/SignupLoadingPage";
import SignupResultPage from "../pages/SignupResultPage";

import HomePage from "../pages/HomePage";
import MealDetailPage from "../pages/MealDetailPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupVerifyPage />} />
      <Route path="/signup/create" element={<SignupCreatePage />} />
      <Route path="/signup/profile" element={<SignupProfilePage />} />
      <Route path="/signup/allergy" element={<SignupAllergyPage />} />
      <Route path="/signup/goal" element={<SignupGoalPage />} />
      <Route path="/signup/loading" element={<SignupLoadingPage />} />
      <Route path="/signup/result" element={<SignupResultPage />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/meal-details/:mealKey" element={<MealDetailPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}