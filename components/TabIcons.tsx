import React from 'react';
import Svg, { Path, G, Rect, SvgProps } from 'react-native-svg';

export const HomeIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 16 16" fill="none" {...props}>
        <Path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z" fill={props.fill || "#FFFFFF"} />
    </Svg>
);

export const QuestsIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 16 16" fill="none" {...props}>
        <Path d="M8 9C8.55229 9 9 8.55229 9 8C9 7.44772 8.55229 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55229 7.44772 9 8 9Z" fill={props.fill || "#FFFFFF"} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM6 6L4 11L5 12L10 10L12 5L11 4L6 6Z" fill={props.fill || "#FFFFFF"} />
    </Svg>
);

export const ScanIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M2 9V6.5C2 4.01 4.01 2 6.5 2H9" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 2H17.5C19.99 2 22 4.01 22 6.5V9" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M22 16V17.5C22 19.99 19.99 22 17.5 22H16" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 22H6.5C4.01 22 2 19.99 2 17.5V15" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M10.5 7V9C10.5 10 10 10.5 9 10.5H7C6 10.5 5.5 10 5.5 9V7C5.5 6 6 5.5 7 5.5H9C10 5.5 10.5 6 10.5 7Z" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M18.5 7V9C18.5 10 18 10.5 17 10.5H15C14 10.5 13.5 10 13.5 9V7C13.5 6 14 5.5 15 5.5H17C18 5.5 18.5 6 18.5 7Z" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M10.5 15V17C10.5 18 10 18.5 9 18.5H7C6 18.5 5.5 18 5.5 17V15C5.5 14 6 13.5 7 13.5H9C10 13.5 10.5 14 10.5 15Z" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M18.5 15V17C18.5 18 18 18.5 17 18.5H15C14 18.5 13.5 18 13.5 17V15C13.5 14 14 13.5 15 13.5H17C18 13.5 18.5 14 18.5 15Z" stroke={props.fill || "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const FeedIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M10 8L16 12L10 16V8Z" fill={props.fill || "#FFFFFF"} />
        <Path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill={props.fill || "#FFFFFF"} />
    </Svg>
);

export const InventoryIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path fillRule="evenodd" clipRule="evenodd" d="M22 11.9342C22 11.956 22 11.978 22 12L22 16.0658C22 16.9523 22.0001 17.7161 21.9179 18.3278C21.8297 18.9833 21.631 19.6117 21.1213 20.1213C20.6117 20.631 19.9833 20.8297 19.3278 20.9179C18.7161 21.0001 17.9523 21.0001 17.0658 21L6.93416 21C6.04768 21.0001 5.28386 21.0001 4.6722 20.9179C4.01669 20.8297 3.38834 20.631 2.87867 20.1213C2.36901 19.6117 2.17027 18.9833 2.08213 18.3278C1.9999 17.7161 1.99994 16.9523 1.99999 16.0658L1.99999 11.9342C1.99994 11.0477 1.9999 10.2839 2.08213 9.67221C2.17027 9.0167 2.36901 8.38835 2.87867 7.87868C3.38834 7.36902 4.01669 7.17028 4.6722 7.08215C5.28386 6.99991 6.04768 6.99995 6.93417 7L17 7C17.022 7 17.044 7 17.0658 7C17.9523 6.99995 18.7161 6.99991 19.3278 7.08215C19.9833 7.17028 20.6117 7.36902 21.1213 7.87868C21.631 8.38835 21.8297 9.0167 21.9179 9.67221C22.0001 10.2839 22 11.0477 22 11.9342Z" fill={props.fill || "#FFFFFF"} />
        <Path d="M19 6.04361V5.71429C19 4.21523 17.7848 3 16.2857 3H7.71429C6.21523 3 5 4.21523 5 5.71429V6.0436C5.57491 5.99987 6.22076 5.99994 6.88123 6.00001L17.1187 6.00001C17.7792 5.99994 18.4251 5.99987 19 6.04361Z" fill={props.fill || "#FFFFFF"} />
    </Svg>
);

export const ProfileIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 20 20" {...props}>
        <G id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <G id="Dribbble-Light-Preview" transform="translate(-140.000000, -2159.000000)" fill={props.fill || "#FFFFFF"}>
                <G id="icons" transform="translate(56.000000, 160.000000)">
                    <Path d="M100.562548,2016.99998 L87.4381713,2016.99998 C86.7317804,2016.99998 86.2101535,2016.30298 86.4765813,2015.66198 C87.7127655,2012.69798 90.6169306,2010.99998 93.9998492,2010.99998 C97.3837885,2010.99998 100.287954,2012.69798 101.524138,2015.66198 C101.790566,2016.30298 101.268939,2016.99998 100.562548,2016.99998 M89.9166645,2004.99998 C89.9166645,2002.79398 91.7489936,2000.99998 93.9998492,2000.99998 C96.2517256,2000.99998 98.0830339,2002.79398 98.0830339,2004.99998 C98.0830339,2007.20598 96.2517256,2008.99998 93.9998492,2008.99998 C91.7489936,2008.99998 89.9166645,2007.20598 89.9166645,2004.99998 M103.955674,2016.63598 C103.213556,2013.27698 100.892265,2010.79798 97.837022,2009.67298 C99.4560048,2008.39598 100.400241,2006.33098 100.053171,2004.06998 C99.6509769,2001.44698 97.4235996,1999.34798 94.7348224,1999.04198 C91.0232075,1998.61898 87.8750721,2001.44898 87.8750721,2004.99998 C87.8750721,2006.88998 88.7692896,2008.57398 90.1636971,2009.67298 C87.1074334,2010.79798 84.7871636,2013.27698 84.044024,2016.63598 C83.7745338,2017.85698 84.7789973,2018.99998 86.0539717,2018.99998 L101.945727,2018.99998 C103.221722,2018.99998 104.226185,2017.85698 103.955674,2016.63598" id="profile_round-[#1342]" />
                </G>
            </G>
        </G>
    </Svg>
);
