import { assistantProfile } from "../assets/assitantProfile";

export const Welcome: React.FC = () => (
  <div className="bg-white border-gray-100 border-2 rounded-lg px-8 py-5 mr-20 w-full">
    <div className="flex items-center mb-2">
      <img
        src={assistantProfile.image}
        alt="Assistant"
        className="w-20 h-20 rounded-full mr-4"
      />
      <h1 className="text-2xl font-bold">
        Hello! Welcome to BMW, I am {assistantProfile.name} your sales assistant.
      </h1>
    </div>
    <p>
      I'm here to assist you in finding the perfect car that suits your needs.
      Whether you have questions about specific models, features, or financing options, I'm here to help. How can I assist you today?
    </p>
  </div>
);