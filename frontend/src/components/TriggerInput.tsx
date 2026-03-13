import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TriggerInputProps {
  triggers: string[];
  onChange: (triggers: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const TriggerInput: React.FC<TriggerInputProps> = ({
  triggers,
  onChange,
  placeholder = "Agregar palabra clave...",
  disabled = false,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const addTrigger = (trigger: string) => {
    const trimmed = trigger.trim();
    if (trimmed && !triggers.includes(trimmed)) {
      onChange([...triggers, trimmed]);
    }
  };

  const removeTrigger = (index: number) => {
    onChange(triggers.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTrigger(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && triggers.length > 0) {
      // Remove last trigger when backspacing on empty input
      removeTrigger(triggers.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Handle paste with commas
    if (value.includes(',')) {
      const newTriggers = value.split(',').map(t => t.trim()).filter(t => t);
      const uniqueNewTriggers = newTriggers.filter(t => !triggers.includes(t));
      onChange([...triggers, ...uniqueNewTriggers]);
      setInputValue('');
    } else {
      setInputValue(value);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTrigger(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={`trigger-input-container ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {triggers.map((trigger, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-500/30"
          >
            <span>{trigger}</span>
            {!disabled && (
              <button
                onClick={() => removeTrigger(index)}
                className="ml-1 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        {!disabled && (
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={triggers.length === 0 ? placeholder : ""}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-w-[120px]"
              disabled={disabled}
            />
            {inputValue && (
              <button
                onClick={() => {
                  addTrigger(inputValue);
                  setInputValue('');
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200 transition-colors"
                type="button"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {triggers.length === 0 
          ? "Escribe palabras clave y presiona Enter o coma para agregarlas"
          : `Presiona Enter, coma o haz clic en + para agregar más palabras. Actualmente: ${triggers.length} ${triggers.length === 1 ? 'palabra clave' : 'palabras clave'}`
        }
      </p>
      
      {/* Hidden input for form submission compatibility */}
      <input
        type="hidden"
        name="triggers"
        value={triggers.join(', ')}
      />
    </div>
  );
};
