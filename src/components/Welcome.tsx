import { assistantProfile } from "../assets/assitantProfile";

export const Welcome: React.FC = () => (
  <div className="bg-white border-gray-100 border-2 rounded-lg px-8 py-5 mr-20 w-full">
    <div className="flex items-center mb-2">
      <img
        src={assistantProfile.image}
        alt="Assistant"
        className="w-20 h-20 rounded-full mr-4"
      />
    </div>
    <p>
    Hey there! Welcome to BMW. I'm {assistantProfile.name}, your sales assistant. Are you looking for something specific today, or would you like some suggestions? Whether you have questions about models, features, or financing, I've got you covered. How can I assist you?
    </p>
  </div>
);