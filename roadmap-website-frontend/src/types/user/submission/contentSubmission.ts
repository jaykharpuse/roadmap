export type SubmissionType = 'roadmap' | 'resource' | 'node' | 'update'; 
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'merged'; 


export  interface ContentSubmission {
      _id: string; 
      type: SubmissionType; 
      user: {
          _id: string; 
          username : string; 
          avatar?:string; 
      }; 
      status: SubmissionStatus; 
      roadmap?:string; 
      node?: string;
      resource?:string; 
      data?:Record<string, any>; 
      reviewNotes?:string; 
      reviewedBy?: {
        _id: string;
        username: string; 
        avatar?:string; 
      }; 
      reviewedAt?:string; 
      createdAt: string; 
      updatedAt?: string; 
}