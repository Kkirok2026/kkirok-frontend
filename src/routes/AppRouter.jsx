import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";

import StartPage from "../pages/StartPage";
import LoginPage from "../pages/LoginPage";

import SignupVerifyPage from "../pages/SignupVerifyPage";
import SignupCreatePage from "../pages/SignupCreatePage";
import SignupProfilePage from "../pages/SignupProfilePage";
import SignupGoalPage from "../pages/SignupGoalPage";
import SignupLoadingPage from "../pages/SignupLoadingPage";
import SignupResultPage from "../pages/SignupResultPage";

import HomePage from "../pages/HomePage";
import MealDetailPage from "../pages/MealDetailPage";
import FoodSearchPage from "../pages/FoodSearchPage";
import FoodDetailPage from "../pages/FoodDetailPage";
import UniversityMealPage from "../pages/UniversityMealPage";
import ProfilePage from "../pages/ProfilePage";
import ProfileEditPage from "../pages/ProfileEditPage";
import ProfileGoalEditPage from "../pages/ProfileGoalEditPage";
import DeleteAccountPage from "../pages/DeleteAccountPage";
import CreateMealPage from "../pages/CreateMealPage";
import IphonePreviewPage from "../pages/IphonePreviewPage";

function RootRoute() {
  const [searchParams] = useSearchParams();

  if (searchParams.get("demoDevice") === "iphone-17-pro") {
    return <StartPage />;
  }

  return <IphonePreviewPage />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/start" element={<StartPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupVerifyPage />} />
      <Route path="/signup/create" element={<SignupCreatePage />} />
      <Route path="/signup/profile" element={<SignupProfilePage />} />
      <Route path="/signup/allergy" element={<Navigate to="/signup/profile" replace />} />
      <Route path="/signup/goal" element={<SignupGoalPage />} />
      <Route path="/signup/loading" element={<SignupLoadingPage />} />
      <Route path="/signup/result" element={<SignupResultPage />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/meal-details/:mealKey" element={<MealDetailPage />} />
      <Route path="/search" element={<FoodSearchPage />} />
      <Route path="/foods/:foodId" element={<FoodDetailPage />} />
      <Route path="/university-meal" element={<UniversityMealPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/food-detail/:foodName" element={<FoodDetailPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
      <Route path="/profile/edit/goal" element={<ProfileGoalEditPage />} />
      <Route path="/profile/delete" element={<DeleteAccountPage />} />
      <Route path="/create-meal" element={<CreateMealPage />} />
      <Route path="/preview" element={<IphonePreviewPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
