import { Href, Link } from 'expo-router';
import { type ComponentProps } from 'react';
import { Linking } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      {...rest}
      href={href}
      onPress={async (event) => {
        // Prevent in-app routing and open the URL in the system browser.
        event.preventDefault();
        await Linking.openURL(href);
      }}
    />
  );
}
