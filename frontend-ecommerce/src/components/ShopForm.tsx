import React from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Save } from 'lucide-react';

interface ShopFormProps {
  onSubmit: (data: unknown) => void;
  initialData?: unknown;
}

export function ShopForm({ onSubmit, initialData }: ShopFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-nolt-black">
          Nom de la boutique
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: "Le nom est obligatoire" })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-nolt-orange focus:outline-none focus:ring-1 focus:ring-nolt-orange"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-nolt-black">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-nolt-orange focus:outline-none focus:ring-1 focus:ring-nolt-orange"
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-md bg-nolt-orange px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-nolt-orange focus:ring-offset-2"
      >
        {initialData ? (
          <>
            <Save className="h-5 w-5" />
            Sauvegarder
          </>
        ) : (
          <>
            <Plus className="h-5 w-5" />
            Créer la boutique
          </>
        )}
      </button>
    </form>
  );
}