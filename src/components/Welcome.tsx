import { assistantProfile } from "../assets/assitantProfile";

export const Welcome: React.FC = () => (
  <div className="flex flex-col items-start">
    <div className="flex items-center mb-2">
      <img
        src={assistantProfile.image}
        alt="Assistant"
        className="w-14 h-14 rounded-full mr-4"
      />
      <p className="text-center">{assistantProfile.name}</p>
    </div>
    <div className="bg-gray-100 border-gray-300 border-2 rounded-lg p-2 mr-20 w-full">
      <p>
        Hey there! Welcome to BMW. I'm {assistantProfile.name}, your sales assistant. Are you looking for something specific today, or would you like some suggestions? Whether you have questions about models, features, or financing, I've got you covered. How can I assist you?
      </p>
    </div>
  </div>
);
