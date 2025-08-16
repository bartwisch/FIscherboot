import Yellowfish from "./Yellowfish";

const YellowfishSpawner = ({ yellowfishConfigs, screenWidth }) => {
  return (
    <>
      {yellowfishConfigs.map((config) => (
        <Yellowfish
          key={config.id}
          ref={config.ref}
          position={config.position}
          speed={config.speed}
          scale={config.size}
          screenWidth={screenWidth}
          spawnDelay={config.spawnDelay}
          userData={{ fishId: config.id }}
        />
      ))}
    </>
  );
};

export default YellowfishSpawner;