export interface TopViewedRoadmap{
     roadmap: string; 
     views: number; 
}




export interface TopCompletedRoadmap{
      roadmap:string; 
      completions: number; 
}


export interface TopClickedResource{
     resource: string; 
     clicks: number; 
}


export interface LocationData{
      country?: string; 
      region?:string; 
      users: number; 
}



export interface ReferrerData{
      source?:string; 
      count:number; 
}


export interface AnalyticsData{
      _id?: string; 
      date: string; 
      users:{
          total: number; 
          new: number; 
          active: number; 
      }; 

      roadmaps: {
          views: number; 
          topViewed: TopViewedRoadmap[]; 
          topCompleted: TopCompletedRoadmap[]; 
      }; 

      resources: {
          clicks: number; 
          topClicked: TopClickedResource[]; 
      }; 

      engagement: {
          averageSessionDuration: number; 
          pagesPerSession: number; 
          bounceRate: number; 
      }; 

      devices: {
          desktop: number; 
          mobile: number; 
          tablet: number; 
      }; 

      locations: LocationData[]; 
      referrers: ReferrerData[];
      createdAt?: string; 
      updatedAt?: string; 
}



export interface AnalyticsState{
      isLoading: boolean; 
      analyticsList: AnalyticsData[]; 
      selectedAnalytics: AnalyticsData | null; 
      error: string | null; 
}

