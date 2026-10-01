'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import toast from '@/utils/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().trim().optional(),
  role: z.enum(['ADMIN', 'BUSINESS_OWNER', 'BUSINESS_REGISTRAR', 'ACCOUNTANT']),
  password: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().min(6, 'Password must be at least 6 characters').optional(),
  ),
  confirmPassword: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;
type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserFormValues['role'];
};

type UserFormProps = {
  userId?: string;
  onBack?: () => void;
  onSuccess?: () => void;
};

export default function UserForm({ userId, onBack, onSuccess }: UserFormProps) {
  const router = useRouter();
  const isEditing = Boolean(userId);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [pendingUpdate, setPendingUpdate] = useState<UserFormValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', phone: '', role: 'BUSINESS_OWNER', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!userId) {
      form.reset({ name: '', email: '', phone: '', role: 'BUSINESS_OWNER', password: '', confirmPassword: '' });
      setIsFetching(false);
      return;
    }

    const controller = new AbortController();
    const selectedId = userId;
    setIsFetching(true);
    setSubmitError(null);
    form.reset({ name: '', email: '', phone: '', role: 'BUSINESS_OWNER', password: '', confirmPassword: '' });

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${selectedId}?_=${Date.now()}`, {
          cache: 'no-store',
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || data.details || 'Failed to load selected user');
        const user = data.user as User;
        if (user.id !== selectedId) throw new Error('The server returned a different user. Please reopen the form.');
        form.reset({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role,
          password: '',
          confirmPassword: '',
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSubmitError(error instanceof Error ? error.message : 'Failed to load selected user');
        }
      } finally {
        if (!controller.signal.aborted) setIsFetching(false);
      }
    };

    void fetchUser();
    return () => controller.abort();
  }, [userId, form]);

  const saveUser = async (values: UserFormValues) => {
    if (!isEditing && !values.password) {
      form.setError('password', { message: 'Password is required' });
      return;
    }
    if (!isEditing && values.password !== values.confirmPassword) {
      form.setError('confirmPassword', { message: "Passwords don't match" });
      return;
    }

    setPendingUpdate(null);
    setSubmitError(null);
    setIsLoading(true);
    try {
      const payload: Partial<UserFormValues> = { ...values };
      if (isEditing && !form.formState.dirtyFields.email) delete payload.email;
      if (!payload.password) delete payload.password;
      delete payload.confirmPassword;
      const response = await fetch(isEditing ? `/api/users/${userId}` : '/api/users', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.details || `Failed to ${isEditing ? 'update' : 'create'} user`);

      toast.success(`User ${isEditing ? 'updated' : 'created'} successfully`);
      if (onSuccess) onSuccess();
      else router.push(`/users/${data.user.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const requestSubmit = (values: UserFormValues) => {
    setSubmitError(null);
    if (isEditing) setPendingUpdate(values);
    else void saveUser(values);
  };

  if (isFetching) return <div className="flex h-60 items-center justify-center"><Loader size="large" /></div>;

  return (
    <div className="w-full">
      <Card className="mb-8 overflow-hidden">
        <CardHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            {onBack && <button type="button" onClick={onBack} className="mr-3 rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Go back"><ArrowLeftIcon className="h-5 w-5" /></button>}
            <CardTitle>{isEditing ? 'Edit User' : 'Create User'}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Form form={form} onSubmit={form.handleSubmit(requestSubmit)} className="space-y-6" autoComplete="off">
            {submitError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{submitError}</div>}

            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Enter name" autoComplete="off" data-lpignore="true" data-1p-ignore="true" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Enter email address" autoComplete="one-time-code" data-lpignore="true" data-1p-ignore="true" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="Enter phone number" autoComplete="off" data-lpignore="true" data-1p-ignore="true" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <select {...field} disabled={isLoading} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                    <option value="ADMIN">Admin</option><option value="BUSINESS_OWNER">Business Owner</option><option value="BUSINESS_REGISTRAR">Business Registrar</option><option value="ACCOUNTANT">Accountant</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => <FormItem><FormLabel>{isEditing ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel><FormControl><Input type="password" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" className="[&::-ms-reveal]:hidden [&::-ms-clear]:hidden" placeholder={isEditing ? 'Enter new password (optional)' : 'Enter password'} {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>} />
            {!isEditing && <FormField control={form.control} name="confirmPassword" render={({ field }) => <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" className="[&::-ms-reveal]:hidden [&::-ms-clear]:hidden" placeholder="Confirm password" {...field} disabled={isLoading} /></FormControl><FormMessage /></FormItem>} />}
          </Form>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex gap-3">
            {onBack && <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>Cancel</Button>}
            <Button type="button" onClick={form.handleSubmit(requestSubmit)} disabled={isLoading}>{isLoading ? <><Loader size="small" className="mr-2" />{isEditing ? 'Updating...' : 'Creating...'}</> : isEditing ? 'Update User' : 'Create User'}</Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmDialog
        isOpen={Boolean(pendingUpdate)}
        title="Confirm user update"
        message={`Update ${pendingUpdate?.name || 'this user'} (${pendingUpdate?.email || 'no email'}) with the entered details?`}
        confirmText="Update User"
        cancelText="Review Changes"
        variant="info"
        onClose={() => setPendingUpdate(null)}
        onConfirm={() => pendingUpdate && void saveUser(pendingUpdate)}
      />
    </div>
  );
}
