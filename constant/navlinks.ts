import {
  Scissors, TrendingUp, User, MessageSquare, Calendar,
  Star, Settings,  BarChart2,  CalendarDays,
} from 'lucide-react'


export const navItems = [
  {
     icon: TrendingUp,
     label: 'Dashboard',    
     href: '/dashboard' 
    },
  { 
    icon: User,          
    label: 'My Profile',   
    href: '/dashboard/profile' 
},
  { 
    icon: MessageSquare, 
    label: 'Inquiries',    
    href: '/dashboard/inquiries' 
},
  { 
    icon: Calendar,      
    label: 'Bookings',     
    href: '/dashboard/bookings' 
},
  { 
    icon: CalendarDays,  
    label: 'Availability', 
    href: '/availability' 
},
  { 
    icon: Star,          
    label: 'Reviews',      
    href: '/dashboard/reviews'
 },
  { 
    icon: BarChart2,     
    label: 'Earnings',     
    href: '/dashboard/earnings' 
},
  { 
    icon: Settings,      
    label: 'Settings',     
    href: '/dashboard/settings' 
},
]