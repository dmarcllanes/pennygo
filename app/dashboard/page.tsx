'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { checkUserSession, signOut, UserSessionResult } from '@/app/_lib/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, ArrowLeft, PlusCircle, Menu, X, Flame, Leaf, Sparkles, Diamond, Umbrella, Mountain, Building, Flower2, Compass, Landmark } from 'lucide-react';
import { supabase } from '@/app/_lib/supabase';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import OrganizerDashboard from '../organizer/OrganizerDashboard';
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoIcon } from '@/components/ui/logo-icon';

interface ExtendedUser extends User {
  isAdmin?: boolean;
  profile?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface Trip {
  id: string;
  user_id: string;
  title: string;
  trips_type: string;
  location: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  image_url: string;
  social_media: string;
  days: number;
  nights: number;
  inclusions: string;
}

const categories = [
  { icon: Flame, label: 'Trending' },
  { icon: Leaf, label: 'Eco-stays' },
  { icon: Sparkles, label: 'Unique' },
  { icon: Diamond, label: 'Luxe' },
  { icon: Umbrella, label: 'Beach' },
  { icon: Mountain, label: 'Mountains' },
  { icon: Building, label: 'Cities' },
  { icon: Flower2, label: 'Wellness' },
  { icon: Compass, label: 'Adventure' },
  { icon: Landmark, label: 'Cultural' },
];

export default function Dashboard() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [userType, setUserType] = useState<'traveler' | 'organizer'>('traveler');
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [validId1, setValidId1] = useState<File | null>(null);
  const [validId2, setValidId2] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [organizerStatus, setOrganizerStatus] = useState<'not_applied' | 'pending' | 'approved'>('not_applied');
  const [showOrganizerContent, setShowOrganizerContent] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTripDetailsModalOpen, setIsTripDetailsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Trending');

  useEffect(() => {
    const checkUser = async () => {
      const result: UserSessionResult = await checkUserSession();
      if (result.user) {
        setUser(result.user);
        const userType = result.user.user_metadata?.user_type || 'traveler';
        const organizerStatus = result.user.user_metadata?.organizer_status || 'not_applied';
        
        setUserType(userType as 'traveler' | 'organizer');
        setOrganizerStatus(organizerStatus as 'not_applied' | 'pending' | 'approved');
        
        if (organizerStatus === 'approved') {
          setUserType('organizer');
        }

        const avatarUrl = result.user.user_metadata?.avatar_url || result.user.profile?.avatar_url;
        if (avatarUrl) {
          try {
            const { data } = await supabase.storage
              .from('avatars')
              .createSignedUrl(avatarUrl.split('/').pop()!, 3600);
            setAvatarUrl(data?.signedUrl || avatarUrl);
          } catch (error) {
            console.error('Error fetching avatar URL:', error);
          }
        }
      } else {
        router.push('/signin');
      }
    };

    checkUser();

    const intervalId = setInterval(checkUser, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);

  useEffect(() => {
    const fetchTrips = async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
        toast({
          title: "Error",
          description: "Failed to fetch trips. Please try again.",
          variant: "destructive",
        });
      } else if (data) {
        const tripsWithUrls = await Promise.all(data.map(async (trip) => {
          if (trip.image_url) {
            try {
              const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('trips')
                .createSignedUrl(trip.image_url, 3600);

              if (signedUrlError) {
                console.error('Error creating signed URL:', signedUrlError);
                return trip;
              }

              return { ...trip, image_url: signedUrlData.signedUrl };
            } catch (error) {
              console.error('Unexpected error creating signed URL:', error);
              return trip;
            }
          }
          return trip;
        }));
        setTrips(tripsWithUrls);
      }
    };

    fetchTrips();
  }, [toast]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSwitchToTraveler = () => {
    setShowOrganizerContent(false);
    setUserType('traveler');
  };

  const handleSwitchToOrganizer = () => {
    setShowOrganizerContent(true);
  };

  const handleVerification = async () => {
    if (!validId1 || !validId2) {
      toast({
        title: "Error",
        description: "Please upload both valid IDs",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const validId1File = await uploadFile(validId1, 'valid-ids');
      const validId2File = await uploadFile(validId2, 'valid-ids');

      const { data: verificationData, error: verificationError } = await supabase
        .from('organizer_verifications')
        .insert({
          user_id: user?.id,
          valid_id_1: validId1File,
          valid_id_2: validId2File,
          status: 'pending'
        });

      if (verificationError) {
        console.error('Error inserting verification record:', verificationError);
        throw verificationError;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ organizer_status: 'pending' })
        .eq('user_id', user?.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }

      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: { organizer_status: 'pending' }
      });

      if (userUpdateError) {
        console.error('Error updating user metadata:', userUpdateError);
        throw userUpdateError;
      }

      setIsVerificationModalOpen(false);
      setOrganizerStatus('pending');
      toast({
        title: "Success",
        description: "Your verification request has been submitted. We will review it shortly.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error during verification:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileName = `${user?.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    if (error) throw error;
    return fileName;
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTripDetailsModalOpen(true);
  };

  const handleBecomeOrganizer = () => {
    if (organizerStatus === 'not_applied') {
      setIsVerificationModalOpen(true);
    } else if (organizerStatus === 'pending') {
      toast({
        title: "Application Pending",
        description: "Your organizer application is still under review.",
        variant: "default",
      });
    }
  };

  if (!user) {
    return null;
  }

  const fullName = user?.user_metadata?.full_name || 'User';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-200" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <LogoIcon 
              src="/logo.png" 
              alt="PennyGo" 
              width={isScrolled ? 40 : 50} 
              height={isScrolled ? 40 : 50} 
              className="transition-all duration-300" 
            />
            
            {/* Search bar - hidden on mobile, visible on larger screens */}
            <div className="hidden md:flex flex-grow mx-4 max-w-2xl">
              <div className="relative w-full">
                <Input 
                  className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Search trips..."
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {!user ? (
                <>
                  <Link href="/signin">
                    <Button className="bg-black text-white hover:bg-gray-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-black text-white hover:bg-gray-800">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Switch to Organizer button */}
                  {organizerStatus === 'approved' && !showOrganizerContent && (
                    <Button
                      variant="outline"
                      className="text-sm items-center space-x-1 text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 border-gray-200 dark:border-gray-700"
                      onClick={() => setShowOrganizerContent(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      <span>Switch to Organizer</span>
                    </Button>
                  )}

                  {/* User menu button */}
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="outline"
                      className={`flex items-center justify-center rounded-full border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <Avatar className={`transition-all duration-300 ${isScrolled ? 'h-6 w-6' : 'h-8 w-8'}`}>
                        <AvatarImage src={avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} alt={fullName} />
                        <AvatarFallback>{fullName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </Button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                        <div className="px-4 py-2 text-sm text-gray-800 dark:text-white">
                          <p className="font-semibold">{fullName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{user.email}</p>
                        </div>
                        <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                          Profile
                        </Link>
                        <Link href="/dashboard/booking" className="block px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                          Booking
                        </Link>
                        {user?.isAdmin && (
                          <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="md:hidden bg-white dark:bg-gray-800 p-4">
        <div className="relative">
          <Input 
            className="w-full pl-10 pr-4 py-2 rounded-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder="Search trips..."
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {showOrganizerContent ? (
          <OrganizerDashboard onSwitchToTraveler={handleSwitchToTraveler} />
        ) : (
          <>
            {/* Updated "Become an Organizer" button with responsive styling */}
            {organizerStatus !== 'approved' && (
              <div className="mb-8 sm:mb-12 text-center px-4 sm:px-0">
                <Button
                  onClick={handleBecomeOrganizer}
                  className="
                    w-full sm:w-auto
                    bg-gradient-to-r from-pink-500 to-yellow-500 
                    hover:from-pink-600 hover:to-yellow-600 
                    text-white font-bold py-3 px-4 sm:px-6 rounded-full 
                    shadow-lg transform transition duration-300 hover:scale-105
                    text-sm sm:text-lg
                  "
                >
                  {organizerStatus === 'pending' ? (
                    <>
                      <span className="mr-1 sm:mr-2">🕒</span>
                      <span className="hidden sm:inline">Organizer </span>Application Pending
                    </>
                  ) : (
                    <>
                      <span className="mr-1 sm:mr-2">🚀</span>
                      Become an Organizer
                    </>
                  )}
                </Button>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4 sm:px-0">
                  {organizerStatus === 'pending' 
                    ? "We're reviewing your application. We'll notify you soon!"
                    : "Start your journey as a trip organizer today!"}
                </p>
              </div>
            )}

            <div className="w-full bg-transparent dark:bg-transparent py-6 overflow-x-auto">
              <div className="flex flex-nowrap justify-center gap-4 min-w-max md:min-w-0 pb-4">
                {categories.map((category) => (
                  <button
                    key={category.label}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 ${
                      activeCategory === category.label
                        ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white'
                        : 'bg-transparent text-black hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500 hover:text-white dark:text-white'
                    }`}
                    onClick={() => setActiveCategory(category.label)}
                  >
                    <category.icon className={`w-6 h-6 mb-2 transition-colors duration-300 ${
                      activeCategory === category.label
                        ? 'text-white'
                        : 'text-black dark:text-white group-hover:text-white'
                    }`} />
                    <span className="text-xs font-medium transition-colors duration-300">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-[60px] shadow-lg p-8 mb-12">
                <h2 className="text-4xl font-bold mb-8 inline-block">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500 animate-pulse">
                    Available Trips
                  </span>
                </h2>
                {trips.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {trips.map((trip) => (
                      <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        {trip.image_url && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={trip.image_url} 
                              alt={trip.title} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                              onError={(e) => {
                                console.error('Error loading image:', e, 'URL:', trip.image_url);
                                e.currentTarget.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                              }}
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">{trip.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{trip.trips_type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2">
                              {trip.location}
                            </span>
                          </p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                            ₱{trip.price.toLocaleString('en-PH')} <span className="text-sm font-normal">per person</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {trip.days} day{trip.days !== 1 ? 's' : ''} / {trip.nights} night{trip.nights !== 1 ? 's' : ''}
                          </p>
                          <Button 
                            className="w-full bg-black text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
                            onClick={() => handleViewDetails(trip)}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">No trips available at the moment.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Host modal */}
      <Dialog open={isHostModalOpen} onOpenChange={setIsHostModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>Become a Trip Organizer</DialogTitle>
            <DialogDescription>
              Are you sure you want to become a trip organizer? This will give you access to create and manage trips.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHostModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsHostModalOpen(false);
              setIsVerificationModalOpen(true);
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification modal */}
      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>Become a Trip Organizer - Verification</DialogTitle>
            <DialogDescription>
              Please upload two valid IDs to verify your identity:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="valid-id-1">Valid ID 1</Label>
              <Input 
                id="valid-id-1" 
                type="file" 
                onChange={(e) => setValidId1(e.target.files?.[0] || null)} 
              />
            </div>
            <div>
              <Label htmlFor="valid-id-2">Valid ID 2</Label>
              <Input 
                id="valid-id-2" 
                type="file" 
                onChange={(e) => setValidId2(e.target.files?.[0] || null)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerificationModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleVerification} 
              disabled={isUploading || !validId1 || !validId2}
              className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:text-gray-200"
            >
              {isUploading ? 'Uploading...' : 'Submit Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trip Details Modal */}
      <Dialog open={isTripDetailsModalOpen} onOpenChange={setIsTripDetailsModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>{selectedTrip?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTrip?.image_url && (
              <img src={selectedTrip.image_url} alt={selectedTrip.title} className="w-full h-48 object-cover rounded-md" />
            )}
            <p><strong>Type:</strong> {selectedTrip?.trips_type}</p>
            <p><strong>Location:</strong> {selectedTrip?.location}</p>
            <p><strong>Price:</strong> ₱{selectedTrip?.price.toLocaleString('en-PH')} per person</p>
            <p><strong>Duration:</strong> {selectedTrip?.days} days / {selectedTrip?.nights} nights</p>
            <p><strong>Description:</strong> {selectedTrip?.description}</p>
            <div>
              <strong>Inclusions:</strong>
              <p>{selectedTrip?.inclusions}</p>
            </div>
            {selectedTrip?.social_media && (
              <a 
                href={selectedTrip.social_media} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-600 hover:text-blue-800 block"
              >
                Visit Social Media Page
              </a>
            )}
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <h4 className="text-lg font-semibold mb-2">Booking Summary</h4>
              <p><strong>Trip:</strong> {selectedTrip?.title}</p>
              <p><strong>Price per person:</strong> ₱{selectedTrip?.price.toLocaleString('en-PH')}</p>
              <p><strong>Duration:</strong> {selectedTrip?.days} days / {selectedTrip?.nights} nights</p>
              <p><strong>Location:</strong> {selectedTrip?.location}</p>
              <p className="mt-2"><strong>Total Price:</strong> ₱{selectedTrip?.price.toLocaleString('en-PH')}</p>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setIsTripDetailsModalOpen(false)}>Close</Button>
            <Button 
              onClick={() => {
                // Handle booking logic here
                console.log('Booking trip:', selectedTrip);
                toast({
                  title: "Booking Initiated",
                  description: "Your booking process has started. Please complete the payment.",
                  variant: "default",
                });
                setIsTripDetailsModalOpen(false);
                // You might want to redirect to a booking page or open a booking modal here
              }}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Book Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}