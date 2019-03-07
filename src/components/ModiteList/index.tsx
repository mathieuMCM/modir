import React, { useState, useEffect, FunctionComponent } from 'react';
import {
  IonList,
  IonContent,
  IonListHeader,
  IonMenuToggle,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonImg,
  IonSearchbar,
  IonSkeletonText,
} from '@ionic/react';
import s from './styles.module.css';

type Modite = {
  real_name: string;
  name: string;
  id: string;
  tz: string;
  color: string;
  profile: {
    title: string;
    last_name: string;
    phone: string;
    email: string;
    image_72: string;
    image_192: string;
    image_512: string;
  };
};

type ListItemProps = {
  list: Modite[];
  filter: string;
  date: Date;
};

const locale = navigator.language;

const getTimeOfDay = (date: Date, timeZone: string) => {
  const hour = ~~date.toLocaleString(locale, {
    timeZone,
    hour: 'numeric',
    hour12: false,
  });
  if (hour < 8 || hour > 22) return '💤';
  return '😃';
};

const ListItem: FunctionComponent<ListItemProps> = ({ list, filter, date }) => (
  <>
    {list
      .filter(
        modite =>
          modite.real_name.toLowerCase().indexOf(filter.toLowerCase()) > -1
      )
      .map(modite => (
        <IonMenuToggle key={modite.id} auto-hide="false">
          <IonItem
            button
            class={s.appear}
            onClick={() => alert(modite.real_name)}
          >
            <IonThumbnail slot="start" class={s.thumbnailContainer}>
              <IonImg
                src={modite.profile.image_72}
                class={s.thumbnail}
                alt={modite.real_name}
              />
            </IonThumbnail>

            <IonLabel>{modite.real_name}</IonLabel>
            <IonLabel class={s.tod}>{getTimeOfDay(date, modite.tz)}</IonLabel>
            <IonLabel class={s.time}>
              {date.toLocaleString(locale, {
                timeZone: modite.tz,
                hour: 'numeric',
                minute: 'numeric',
              })}
            </IonLabel>
          </IonItem>
        </IonMenuToggle>
      ))}
  </>
);

const SkeletonList: React.SFC<{}> = () => (
  <>
    {Array.from(new Array(10)).map((_, index) => (
      <IonItem key={index}>
        <IonThumbnail slot="start" class={s.thumbnailContainer}>
          <IonSkeletonText />
        </IonThumbnail>

        <IonLabel>
          <IonSkeletonText style={{ width: `${Math.random() * 30 + 50}%` }} />
        </IonLabel>
        <IonLabel class={s.tod}>
          <IonSkeletonText style={{ width: '60%' }} />
        </IonLabel>
        <IonLabel class={s.time}>
          <IonSkeletonText style={{ width: '80%' }} />
        </IonLabel>
      </IonItem>
    ))}
  </>
);

function ModiteList() {
  const [modites, setModites] = useState([]);
  const [filter, setFilter] = useState('');
  const [date, setDate] = useState(new Date());

  const tick = () => setDate(new Date());

  useEffect(() => {
    // start the clock
    const intervalID = setInterval(tick, 1000 * 60);
    const clearTimeInterval = () => clearInterval(intervalID);

    // if we already have something, we can safely abandon fetching
    if (modites.length) return clearTimeInterval;

    fetch('https://mosquito-slack-bot.herokuapp.com/modites')
      .then(res => res.json())

      // sort by last name
      .then(modites => {
        setModites(
          modites.sort((prev: Modite, next: Modite) => {
            const prevName = prev.profile.last_name;
            const nextName = next.profile.last_name;

            if (prevName < nextName) return -1;
            if (prevName > nextName) return 1;
            return 0;
          })
        );
      });
  });

  return (
    <IonContent>
      <IonSearchbar
        debounce={200}
        value={filter}
        placeholder="Filter Modites"
        onIonChange={event => setFilter(event.detail.value || '')}
        class={s.slideInDown}
      />

      <IonList>
        <IonListHeader>Modites</IonListHeader>
        {modites.length ? (
          <ListItem list={modites} filter={filter} date={date} />
        ) : (
          <SkeletonList />
        )}
      </IonList>
    </IonContent>
  );
}

export default ModiteList;
