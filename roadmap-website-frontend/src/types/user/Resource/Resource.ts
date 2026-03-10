export interface Resource {
      _id: string; 
      title: string; 
      description?: string; 
      url: string; 
      resourceType: 
      | 'article' 
      | 'video' 
      | 'course' 
      | 'book' 
      | 'documentation' 
      | 'podcast' 
      | 'cheatsheet' 
      | 'tool' 
      | 'other'; 

      contentType?: 'free' | 'paid' | 'freemium' | 'subscription'; 
      language?: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ja' | 'hi' | 'other'; 
      duration?: {
          value: number; 
          unit: 'minutes' | 'hours' | 'pages' | 'lessons'; 
      }; 
      author?:string; 
      publisher?: string; 
      publishedDate?:string; 
      thumbnail?:{
         public_id?:string; 
         url?: string; 
      }; 
      difficulty?: 'beginner' | 'intermediate' | 'advanced'; 
      tags?:string[]; 
      isCommunityContributed?: boolean; 
      contributor?:string; 
      upvotes?: string[]; 
      downvotes?:string[]; 
      stats?: {
         views ?: number;  
         clicks ?: number; 
         rating ?: number; 
         ratingCount?: number; 
        }; 

        isApproved?:boolean; 
        approvedBy?:string; 
        approvedAt?:string; 
        createdAt?: string; 
        updatedAt?: string; 
}