import { AlertProvider } from "@/provider/AlertProvier";
import { Toaster } from "@/components/ui/toaster";
import Translate from "@/pages/translate";
export default function Home() {
  return (
    <>
      <AlertProvider>
        <Translate />
      </AlertProvider>
      <Toaster />
    </>
  );
}
