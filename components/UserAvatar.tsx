'use client';

export interface Profile {
  id: string;
  email: string;
  display_name?: string | null;
  avatar_color?: string | null;
  title?: string | null;
}

function initials(profile: Profile) {
  if (profile.display_name) {
    return profile.display_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
  return profile.email.slice(0, 2).toUpperCase();
}

export default function UserAvatar({
  profile,
  size = 28,
  style,
}: {
  profile: Profile;
  size?: number;
  style?: React.CSSProperties;
}) {
  const color = profile.avatar_color || '#3DD68C';
  return (
    <div
      title={profile.display_name || profile.email}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${color}22`,
        border: `1.5px solid ${color}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        fontSize: size * 0.38,
        fontWeight: 600,
        color: color,
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
    >
      {initials(profile)}
    </div>
  );
}
