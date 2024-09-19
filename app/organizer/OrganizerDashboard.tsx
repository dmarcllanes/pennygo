import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Upload, ChevronRight, Edit, Trash, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { checkUserSession, ExtendedUser, UserSessionResult } from '@/app/_lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/app/_lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogoIcon } from '@/components/ui/logo-icon';

interface OrganizerDashboardProps {
  onSwitchToTraveler: () => void;
}

interface Trip {
  id: string;
  title: string;
  trips_type: string;
  location: string;
  price: number;
  days: number;
  nights: number;
  image_url: string;
  description: string;
  inclusions: string;
  social_media: string;
  capacity: number;
}

export default function OrganizerDashboard({ onSwitchToTraveler }: OrganizerDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);
  const [tripType, setTripType] = useState('');
  const [tripLocation, setTripLocation] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [tripPrice, setTripPrice] = useState('');
  const [tripImage, setTripImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tripSocialMedia, setTripSocialMedia] = useState('');
  const [tripDays, setTripDays] = useState('');
  const [tripNights, setTripNights] = useState('');
  const [tripInclusions, setTripInclusions] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const { toast } = useToast();
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isTripDetailsModalOpen, setIsTripDetailsModalOpen] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isDeleteTripConfirmationOpen, setIsDeleteTripConfirmationOpen] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const tripTypes = [
    "Beach Trips",
    "Mountain and Adventure Trips",
    "Cultural Trips",
    "Island Hopping",
    "Eco-Tourism",
    "Other"
  ];

  useEffect(() => {
    const checkUser = async () => {
      const result: UserSessionResult = await checkUserSession();
      if (result.user) {
        setUser(result.user);
        
        // Check if the user is an organizer
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', result.user.id)
          .single();

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_organizer')
          .eq('user_id', result.user.id)
          .single();

        if (roleError || profileError) {
          console.error('Error checking organizer status:', roleError || profileError);
          return;
        }

        const isOrganizerRole = roleData?.role === 'organizer';
        const isOrganizerProfile = profileData?.is_organizer === true;

        console.log('Organizer role:', isOrganizerRole);
        console.log('Organizer profile:', isOrganizerProfile);

        setIsOrganizer(isOrganizerRole && isOrganizerProfile);
        console.log('Is organizer:', isOrganizerRole && isOrganizerProfile);

        if (!isOrganizerRole || !isOrganizerProfile) {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching trips:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your trips. Please try again.",
            variant: "destructive",
          });
        } else if (data) {
          const tripsWithUrls = await Promise.all(data.map(async (trip) => {
            if (trip.image_url) {
              try {
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                  .from('trips')
                  .createSignedUrl(trip.image_url, 3600); // URL valid for 1 hour

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
      }
    };

    fetchTrips();
  }, [user, toast]);

  if (!user || !isOrganizer) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTripImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTrip = async () => {
    console.log('handleCreateTrip called');
    console.log('Is organizer:', isOrganizer);

    if (!isOrganizer) {
      toast({
        title: "Error",
        description: "You don't have permission to create trips.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = '';
      let socialMediaUrl = '';

      if (tripImage) {
        const fileExt = tripImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        console.log('Uploading image:', fileName);
        const { data: imageData, error: imageError } = await supabase.storage
          .from('trips')
          .upload(fileName, tripImage);

        if (imageError) {
          console.error('Error uploading image:', imageError);
          throw new Error(`Failed to upload image: ${imageError.message}`);
        }
        console.log('Image uploaded successfully:', imageData);
        
        imageUrl = fileName; // Store just the file name, not the full URL
      }

      if (tripSocialMedia) {
        socialMediaUrl = tripSocialMedia;
        console.log('Social media URL:', socialMediaUrl);
      }

      const tripData = {
        user_id: user?.id,
        title: tripTitle,
        trips_type: tripType,
        location: tripLocation,
        description: tripDescription,
        price: parseFloat(tripPrice),
        image_url: imageUrl,
        social_media: socialMediaUrl,
        days: parseInt(tripDays),
        nights: parseInt(tripNights),
        inclusions: tripInclusions,
      };

      console.log('Inserting trip data:', tripData);

      const { data, error } = await supabase
        .from('trips')
        .insert(tripData);

      if (error) {
        console.error('Error inserting trip data:', error);
        throw new Error(`Failed to insert trip data: ${error.message}`);
      }

      console.log('Trip created successfully:', data);

      toast({
        title: "Success",
        description: "Trip created successfully!",
        variant: "default",
      });

      // Clear form and close modal
      setTripTitle('');
      setTripType('');
      setTripLocation('');
      setTripDescription('');
      setTripPrice('');
      setTripImage(null);
      setImagePreview(null);
      setTripSocialMedia('');
      setTripDays('');
      setTripNights('');
      setTripInclusions('');
      setIsCreateTripModalOpen(false);

    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTripDetailsModalOpen(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsEditTripModalOpen(true);
  };

  const handleDeleteTrip = (tripId: string) => {
    setSelectedTrip({ id: tripId } as Trip);
    setIsDeleteTripConfirmationOpen(true);
  };

  const handleUpdateTrip = async () => {
    if (!selectedTrip) return;

    try {
      let imageUrl = selectedTrip.image_url;
      let socialMediaUrl = selectedTrip.social_media;

      if (tripImage) {
        const fileExt = tripImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        console.log('Uploading image:', fileName);
        const { data: imageData, error: imageError } = await supabase.storage
          .from('trips')
          .upload(fileName, tripImage);

        if (imageError) {
          console.error('Error uploading image:', imageError);
          throw new Error(`Failed to upload image: ${imageError.message}`);
        }
        console.log('Image uploaded successfully:', imageData);
        
        imageUrl = fileName; // Store just the file name, not the full URL
      }

      if (tripSocialMedia) {
        socialMediaUrl = tripSocialMedia;
        console.log('Social media URL:', socialMediaUrl);
      }

      const tripData = {
        title: tripTitle,
        trips_type: tripType,
        location: tripLocation,
        description: tripDescription,
        price: parseFloat(tripPrice),
        image_url: imageUrl,
        social_media: socialMediaUrl,
        days: parseInt(tripDays),
        nights: parseInt(tripNights),
        inclusions: tripInclusions,
      };

      console.log('Updating trip data:', tripData);

      const { data, error } = await supabase
        .from('trips')
        .update(tripData)
        .eq('id', selectedTrip.id);

      if (error) {
        console.error('Error updating trip data:', error);
        throw new Error(`Failed to update trip data: ${error.message}`);
      }

      console.log('Trip updated successfully:', data);

      toast({
        title: "Success",
        description: "Trip updated successfully!",
        variant: "default",
      });

      // Clear form and close modal
      setTripTitle('');
      setTripType('');
      setTripLocation('');
      setTripDescription('');
      setTripPrice('');
      setTripImage(null);
      setImagePreview(null);
      setTripSocialMedia('');
      setTripDays('');
      setTripNights('');
      setTripInclusions('');
      setIsEditTripModalOpen(false);

    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDeleteTrip = async () => {
    if (!selectedTrip) return;

    try {
      const { data, error } = await supabase
        .from('trips')
        .delete()
        .eq('id', selectedTrip.id);

      if (error) {
        console.error('Error deleting trip:', error);
        throw new Error(`Failed to delete trip: ${error.message}`);
      }

      console.log('Trip deleted successfully:', data);

      toast({
        title: "Success",
        description: "Trip deleted successfully!",
        variant: "default",
      });

      setIsDeleteTripConfirmationOpen(false);
      setSelectedTrip(null);

    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNumberOfPeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const maxCapacity = selectedTrip?.capacity || 1;
    setNumberOfPeople(Math.min(Math.max(1, value), maxCapacity));
  };

  return (
    <div className="mt-4 sm:mt-8 dark:bg-gray-900 dark:text-white transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center mb-4 sm:mb-0">
          <LogoIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2" src="/logo.png" alt="PennyGo" width={32} height={32} />
          Organizer Dashboard
        </h2>
        <Button
          variant="outline"
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 border-gray-200 dark:border-gray-700"
          onClick={onSwitchToTraveler}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Traveler</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create New Trip</h3>
          <Button className="w-full bg-gray-800 dark:bg-white text-white dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-100" onClick={() => setIsCreateTripModalOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Trip
          </Button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Trips</h3>
          {trips.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trips.map((trip) => (
                <div key={trip.id} className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex-grow pr-4 mb-2 sm:mb-0">
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-white">{trip.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{trip.trips_type} - {trip.location}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">₱{trip.price.toLocaleString('en-PH')} per person</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{trip.days} days / {trip.nights} nights</p>
                  </div>
                  <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                    <Button variant="ghost" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-1" onClick={() => handleViewDetails(trip)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 p-1" onClick={() => handleEditTrip(trip)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 p-1" onClick={() => handleDeleteTrip(trip.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">You haven't created any trips yet.</p>
          )}
        </div>
      </div>

      {/* Update the modals to use dark mode classes */}
      <Dialog open={isTripDetailsModalOpen} onOpenChange={setIsTripDetailsModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white max-w-[95vw] sm:max-w-[80vw] md:max-w-[600px] h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{selectedTrip?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto">
            <div className="space-y-4 p-4">
              {selectedTrip?.image_url && (
                <img src={selectedTrip.image_url} alt={selectedTrip.title} className="w-full h-48 object-cover rounded-md" />
              )}
              <div className="space-y-2">
                <p><strong>Type:</strong> {selectedTrip?.trips_type}</p>
                <p><strong>Location:</strong> {selectedTrip?.location}</p>
                <p><strong>Price:</strong> ₱{selectedTrip?.price?.toLocaleString('en-PH')} per person</p>
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
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <h4 className="text-lg font-semibold mb-2">Booking Summary</h4>
            <div className="space-y-2">
              <p><strong>Trip:</strong> {selectedTrip?.title || 'N/A'}</p>
              <p><strong>Price per person:</strong> ₱{selectedTrip?.price?.toLocaleString('en-PH') || 'N/A'}</p>
              <p><strong>Duration:</strong> {selectedTrip?.days || 0} days / {selectedTrip?.nights || 0} nights</p>
              <p><strong>Location:</strong> {selectedTrip?.location || 'N/A'}</p>
              <div className="mt-2">
                <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number of People (max {selectedTrip?.capacity || 1}):
                </label>
                <div className="flex items-center mt-1">
                  <button
                    onClick={() => setNumberOfPeople(prev => Math.max(1, prev - 1))}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-l"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="numberOfPeople"
                    name="numberOfPeople"
                    min="1"
                    max={selectedTrip?.capacity || 1}
                    value={numberOfPeople}
                    onChange={handleNumberOfPeopleChange}
                    className="w-16 text-center border-t border-b border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => setNumberOfPeople(prev => Math.min((selectedTrip?.capacity || 1), prev + 1))}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="mt-2">
                <strong>Total Price:</strong> ₱{(selectedTrip?.price ? selectedTrip.price * numberOfPeople : 0).toLocaleString('en-PH')}
              </p>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button onClick={() => setIsTripDetailsModalOpen(false)}>Close</Button>
            <Button onClick={() => {
              // Handle booking logic here
              console.log(`Booking for ${numberOfPeople} people`);
              toast({
                title: "Booking Initiated",
                description: `Your booking for ${numberOfPeople} people has started. Please complete the payment.`,
                variant: "default",
              });
              setIsTripDetailsModalOpen(false);
            }}>
              Book Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTripModalOpen} onOpenChange={setIsCreateTripModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Form fields */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="trip-title">Trip Title</Label>
                <Input 
                  id="trip-title" 
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="Enter trip title"
                />
              </div>
              <div>
                <Label htmlFor="trip-type">Trip Type</Label>
                <Select onValueChange={setTripType} value={tripType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip type" />
                  </SelectTrigger>
                  <SelectContent>
                    {tripTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trip-location">Location</Label>
                <Input 
                  id="trip-location" 
                  value={tripLocation}
                  onChange={(e) => setTripLocation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="trip-description">Description</Label>
                <Textarea 
                  id="trip-description" 
                  value={tripDescription}
                  onChange={(e) => setTripDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="trip-price">Price per Person (PHP)</Label>
                <Input 
                  id="trip-price" 
                  type="number"
                  value={tripPrice}
                  onChange={(e) => setTripPrice(e.target.value)}
                  placeholder="Enter price per person in PHP"
                />
              </div>
              <div>
                <Label htmlFor="trip-social-media">Social Media Link</Label>
                <Input 
                  id="trip-social-media" 
                  type="url"
                  value={tripSocialMedia}
                  onChange={(e) => setTripSocialMedia(e.target.value)}
                  placeholder="Enter Facebook page or profile URL"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="trip-days">Number of Days</Label>
                  <Input 
                    id="trip-days" 
                    type="number"
                    value={tripDays}
                    onChange={(e) => setTripDays(e.target.value)}
                    placeholder="Enter number of days"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="trip-nights">Number of Nights</Label>
                  <Input 
                    id="trip-nights" 
                    type="number"
                    value={tripNights}
                    onChange={(e) => setTripNights(e.target.value)}
                    placeholder="Enter number of nights"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="trip-inclusions">Inclusions</Label>
                <Textarea 
                  id="trip-inclusions" 
                  value={tripInclusions}
                  onChange={(e) => setTripInclusions(e.target.value)}
                  placeholder="Enter trip inclusions (e.g., meals, activities, transportation)"
                />
              </div>
              <div>
                <Label htmlFor="trip-image" className="block mb-2">Trip Image</Label>
                <div className="mt-1 flex flex-col items-center">
                  <Label
                    htmlFor="trip-image"
                    className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2 inline-block" />
                    {tripImage ? 'Change Image' : 'Upload Image'}
                  </Label>
                  <Input
                    id="trip-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative w-full max-w-xs">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-auto object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setTripImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTripModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTrip}>Create Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTripModalOpen} onOpenChange={setIsEditTripModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Form fields */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="edit-trip-title">Trip Title</Label>
                <Input 
                  id="edit-trip-title" 
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="Enter trip title"
                />
              </div>
              <div>
                <Label htmlFor="edit-trip-type">Trip Type</Label>
                <Select onValueChange={setTripType} value={tripType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip type" />
                  </SelectTrigger>
                  <SelectContent>
                    {tripTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-trip-location">Location</Label>
                <Input 
                  id="edit-trip-location" 
                  value={tripLocation}
                  onChange={(e) => setTripLocation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-trip-description">Description</Label>
                <Textarea 
                  id="edit-trip-description" 
                  value={tripDescription}
                  onChange={(e) => setTripDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-trip-price">Price per Person (PHP)</Label>
                <Input 
                  id="edit-trip-price" 
                  type="number"
                  value={tripPrice}
                  onChange={(e) => setTripPrice(e.target.value)}
                  placeholder="Enter price per person in PHP"
                />
              </div>
              <div>
                <Label htmlFor="edit-trip-social-media">Social Media Link</Label>
                <Input 
                  id="edit-trip-social-media" 
                  type="url"
                  value={tripSocialMedia}
                  onChange={(e) => setTripSocialMedia(e.target.value)}
                  placeholder="Enter Facebook page or profile URL"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="edit-trip-days">Number of Days</Label>
                  <Input 
                    id="edit-trip-days" 
                    type="number"
                    value={tripDays}
                    onChange={(e) => setTripDays(e.target.value)}
                    placeholder="Enter number of days"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="edit-trip-nights">Number of Nights</Label>
                  <Input 
                    id="edit-trip-nights" 
                    type="number"
                    value={tripNights}
                    onChange={(e) => setTripNights(e.target.value)}
                    placeholder="Enter number of nights"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-trip-inclusions">Inclusions</Label>
                <Textarea 
                  id="edit-trip-inclusions" 
                  value={tripInclusions}
                  onChange={(e) => setTripInclusions(e.target.value)}
                  placeholder="Enter trip inclusions (e.g., meals, activities, transportation)"
                />
              </div>
              <div>
                <Label htmlFor="edit-trip-image" className="block mb-2">Trip Image</Label>
                <div className="mt-1 flex flex-col items-center">
                  <Label
                    htmlFor="edit-trip-image"
                    className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2 inline-block" />
                    {tripImage ? 'Change Image' : 'Upload New Image'}
                  </Label>
                  <Input
                    id="edit-trip-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {(imagePreview || selectedTrip?.image_url) && (
                    <div className="mt-2 relative w-full max-w-xs">
                      <img 
                        src={imagePreview || selectedTrip?.image_url} 
                        alt="Preview" 
                        className="w-full h-auto object-cover rounded-md"
                      />
                      <button
                        onClick={() => {
                          setTripImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTripModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTrip}>Update Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteTripConfirmationOpen} onOpenChange={setIsDeleteTripConfirmationOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this trip? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTripConfirmationOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteTrip}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}