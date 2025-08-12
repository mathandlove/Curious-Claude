import { FileText } from 'lucide-react';

interface AbsenceHeroUIProps {
  visible: boolean;
}

export default function AbsenceHeroUI({ visible }: AbsenceHeroUIProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-background text-foreground px-6 transition-opacity duration-1000 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-3xl w-full mx-auto text-center mt-0 sm:mt-0">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 mb-4">
          <h1 className="text-5xl font-sans font-light text-white">
            Absence Navigator
          </h1>
          <FileText className="h-10 w-10 text-[#7c4a3f]" />
        </div>

        <p className="text-muted-foreground text-xl text-center">
          As an employee, please explain what you want to do...
        </p>
      </div>
    </div>
  );
}