import { assistantProfile } from "../assets/assitantProfile";

export const Welcome: React.FC = () => (
  <div className="bg-white border-gray-100 border-2 rounded-lg px-8 py-5 mr-20 w-full">
    
    <h1 className="text-2xl font-bold mb-2">
    Hello! 👋 Welcome to BMW, I am {assistantProfile.name} your sales assistant.
    </h1>
    <p>
    I'm here to assist you in finding the perfect car that suits your needs. 
    Whether you have questions about specific models, features, or financing options, I'm here to help. How can I assist you today? 🚘
    </p>
  </div>
);
