'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Loader from '@/components/common/Loader';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'BUSINESS_OWNER', 'BUSINESS_REGISTRAR', 'ACCOUNTANT']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // If password is provided, confirm password must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type UserFormValues = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';
  createdAt: string;
  updatedAt: string;
}

interface UserFormProps {
  userId?: string;  // If provided, we're editing a user
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function UserForm({ userId, onBack, onSuccess }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(userId ? true : false);
  const isEditing = !!userId;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'BUSINESS_OWNER',
      password: '',
      confirmPassword: '',
    },
  });

  // Fetch user data if editing
  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.statusText}`);
          }
          
          const data = await response.json();
          const user = data.user as User;
          
          form.reset({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            confirmPassword: '',
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          toast.error('Failed to fetch user details');
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchUser();
    }
  }, [userId, form]);

  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    
    try {
      const endpoint = isEditing ? `/api/users/${userId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      
      // Don't send password if it's empty (for editing)
      const payload = { ...values };
      if (!payload.password) {
        delete payload.password;
      }
      
      // Don't send confirmPassword to the API
      delete payload.confirmPassword;
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} user: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      toast.success(`User ${isEditing ? 'updated' : 'created'} successfully`);
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to the user details page only if onSuccess is not provided
        router.push(`/users/${data.user.id}`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} user:`, error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} user`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="mb-8">
        <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 mr-3 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <CardTitle className="text-xl">
              {isEditing ? 'Edit User' : 'Create User'}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form
            form={form}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter name" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter email address" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
                      <SelectItem value="BUSINESS_REGISTRAR">Business Registrar</SelectItem>
                      <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder={isEditing ? 'Enter new password (optional)' : 'Enter password'} 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Confirm password" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
        
        <CardFooter className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-4 flex justify-end">
          <div className="flex gap-3">
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size="small" className="mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update User' : 'Create User'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 