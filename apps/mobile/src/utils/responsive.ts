import { useWindowDimensions, PixelRatio } from "react-native";
const guidelineBaseWidth = 375, guidelineBaseHeight = 812;
export function scale(size:number,w:number){return size*(w/guidelineBaseWidth);} 
export function verticalScale(size:number,h:number){return size*(h/guidelineBaseHeight);} 
export function moderateScale(size:number,w:number,factor=0.5){return size+(scale(size,w)-size)*factor;} 
export function rf(size:number,w:number){const fs=PixelRatio.getFontScale();return moderateScale(size,w,0.5)/fs;}
export type Breakpoint="sm"|"md"|"lg"|"xl";
export function useBreakpoint(){const {width,height}=useWindowDimensions();const bp:Breakpoint=width<360?"sm":width<600?"md":width<900?"lg":"xl";return{width,height,bp,isSmall:bp==="sm"||bp==="md",isTablet:bp==="lg"||bp==="xl",isDesktop:bp==="xl"};}
