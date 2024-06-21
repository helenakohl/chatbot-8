import {
  FunctionComponent,
  DetailedHTMLProps,
  TableHTMLAttributes,
} from "react";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownProps } from "react-markdown/lib/complex-types";
import remarkGfm from "remark-gfm";
import assistantImage from '../assets/female_BMW_sales_agent.jpg';

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
interface Props {
  message: ChatMessage;
}

// This lets us style any markdown tables that are rendered
const CustomTable: FunctionComponent<
  Omit<
    DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>,
    "ref"
  > &
    ReactMarkdownProps
> = ({ children, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table {...props} className="w-full text-left border-collapse table-auto">
        {children}
      </table>
    </div>
  );
};

/**
 * This component renders a single chat message. It is rendered according to
 * whether it is a message from the assistant or the user.
 */

export const ChatMessage: React.FC<React.PropsWithChildren<Props>> = ({
  message,
}) =>
  message.role === "user" ? (
    <div className="flex items-end justify-end">
      <div className="bg-gray-300 border-gray-100 border-2 rounded-lg p-2 max-w-lg">
        <p>{message.content}</p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-start">
    <div className="flex items-center mb-2">
    <img
        src={assistantImage}
        alt="Assistant"
        className="w-14 h-14 rounded-full mr-4" // Style for the circular profile picture
      />
      <p className="text-center">Name</p>
    </div>
      <div className="bg-gray-100 border-gray-300 border-2 rounded-lg p-2 mr-20 w-full">
        <ReactMarkdown
          children={message.content}
          remarkPlugins={[remarkGfm]}
          components={{
            table: CustomTable,
          }}
        />
      </div>
    </div>
  );
