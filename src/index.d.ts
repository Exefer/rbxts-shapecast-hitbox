// TODO: Find a way to export all types and enums without typescript errors

/**
 * @class Hitbox
 * Create easy hitboxes using Raycasts and Shapecasts.
 *
 * To start using ShapecastHitbox, first initialize your hitbox via
 * ShapecastHitbox.new(instance). After you have configured it, you
 * can activate the hitbox by calling `Hitbox.HitStart()`.
 *
 * To stop the Hitbox, call `Hitbox.HitStop()`. If you are done using
 * the hitbox, it is recommended to call `Hitbox.Destroy()` to clean
 * up any connections left behind.
 *
 * Example usage:
 * ```typescript
 * const hitbox = ShapecastHitbox.new(swordHandle, raycastParams);
 *
 * // The hitbox will automatically disable itself after 3 seconds
 * // The duration field is optional and will last indefinitely otherwise
 * const duration = 3;
 *
 * // HitStart is chainable into OnUpdate. You can alternatively use
 * // `Hitbox.OnUpdate()` on a new line if you prefer multi-lined usage.
 * hitbox.HitStart(duration).OnUpdate(() => {
 *
 *     // We hit something!
 *     if (hitbox.RaycastResult) {
 *
 *         // HitStop is chainable into OnUpdate or HitStart.
 *         // For this example, we'll destroy the hitbox right
 *         // after hitting something.
 *         hitbox.HitStop().Destroy();
 *     }
 * });
 *
 * // Alternative, we can manually destroy the hitbox at some other time.
 * task.delay(10, hitbox.Destroy, hitbox);
 * ```
 */

/**
 * Callback function that runs before HitStart activates the hitbox.
 */
type StartCallback = () => void;
/**
 * Callback function that runs per frame while the hitbox exists.
 */
type UpdateCallback = (delta: number) => void;

/**
 * Callback function activated upon the hitbox returning a RaycastResult.
 */
type HitCallback = (raycastResult: RaycastResult, segmentHit: Segment) => void;

/**
 * Callback function that runs after HitStop has activated.
 */
type StopCallback = (clearCallbacks: boolean) => void;

type CastType = "Blockcast" | "Spherecast" | "Raycast";

interface CastData {
  /**
   * The current cast to use. Can be Blockcast, Spherecast, or Raycast.
   * @default "Raycast"
   */
  CastType: CastType;

  /**
   * The current CFrame of Blockcast. Does nothing if it is not this CastType.
   * @default CFrame.identity
   */
  CFrame: CFrame;

  /**
   * The current size of Blockcast. Does nothing if it is not this CastType.
   * @default Vector3.zero
   */
  Size: Vector3;

  /**
   * The current radius size of Spherecast. Does nothing if it is not this CastType.
   * @default 0
   */
  Radius: number;

  /**
   * Internal property for tracking last CFrame in BlockCast
   */
  _LastCFrameBlockCast?: CFrame;
}

interface Segment {
  /**
   * The instance that this segment belongs to.
   */
  Instance: Instance;

  /**
   * How far this segment has traveled while the hitbox is active.
   */
  Distance: number;

  /**
   * The current position of this segment in the frame.
   */
  Position?: Vector3;

  /**
   * The last direction this segment was moving
   */
  LastDirection: Vector3;

  /**
   * The last RaycastResult returned by this segment.
   */
  RaycastResult?: RaycastResult;

  /**
   * The current CastData of the segment. Defaults to the parent Hitbox's
   * CastData. Can be individually modified to cast differently than other
   * segments.
   */
  CastData: CastData;

  /**
   * Internal update method
   */
  _update(): void;
}

/**
 * @class AdornmentData
 */
interface AdornmentData {
  /**
   * The LineHandleAdornment instance
   */
  Adornment: LineHandleAdornment;

  /**
   * Timestamp of last use
   */
  LastUse: number;
}

interface SphereAdornmentData {
  /**
   * The SphereHandleAdornment instance
   */
  Adornment: SphereHandleAdornment;

  /**
   * Timestamp of last use
   */
  LastUse: number;
}

interface BoxAdornmentData {
  /**
   * The BoxHandleAdornment instance
   */
  Adornment: BoxHandleAdornment;

  /**
   * Timestamp of last use
   */
  LastUse: number;
}

/**
 * Main Hitbox interface
 */
interface Hitbox {
  /**
   * The instance this hitbox is attached to
   */
  Instance?: Instance;

  /**
   * Raycast parameters for the hitbox
   */
  RaycastParams?: RaycastParams;

  /**
   * The current raycast result if any
   */
  RaycastResult?: RaycastResult;

  /**
   * Whether the hitbox is currently active
   */
  Active: boolean;

  /**
   * The resolution of the hitbox's raycasting
   * @default 60
   */
  Resolution: number;

  /**
   * The cast data configuration
   */
  CastData: CastData;

  /**
   * Custom attributes for the hitbox
   */
  Attributes: Record<string, any>;

  /**
   * Whether to filter parts that have already been hit
   */
  FilterPartsHit: boolean;

  /**
   * Gets all segments of a hitbox. Segments refers to each individual
   * point that are being raycasted out of.
   */
  GetAllSegments(): { [key: string]: Segment };

  /**
   * Gets one segment from the hitbox using the original instance
   * as the reference.
   */
  GetSegment(instance: Instance): Segment;

  /**
   * Adds a segment to the hitbox
   */
  AddSegment(descendant: any): Segment;

  /**
   * Removes a segment from the hitbox
   */
  RemoveSegment(descendant: any): Hitbox;

  /**
   * Runs automatically the first time a hitbox is initialized. Can be re-ran
   * again to make the hitbox re-search the instance for any new changes in the
   * hitbox. Do not run frequently as it is not performant.
   */
  Reconcile(): void;

  /**
   * Activates the hitbox. Can be given an optional timer parameter to make
   * the hitbox automatically stop after a certain amount of seconds. OverrideParams
   * can be used to switch RaycastParams on the fly (which the hitbox will default to).
   * Will activate all BeforeStart callbacks before activating the hitbox.
   */
  HitStart(timer?: number, raycastParams?: RaycastParams): Hitbox;

  /**
   * Deactivates the hitbox. Will call all OnStopped callbacks after deactivation.
   */
  HitStop(): Hitbox;

  /**
   * Disconnects the scheduler. When no references to the hitbox remain, it will be
   * automatically garbage collected.
   */
  Destroy(): void;

  /**
   * Sets the resolution of the hitbox's raycasting. This resolution is capped to
   * the user's current frame rate (lower frames = less accurate). Lower accuracy
   * can result in better ShapecastHitbox performance so adjust according to the
   * context of your project.
   * @default 60
   */
  SetResolution(resolution: number): Hitbox;

  /**
   * Sets the current CastData of this hitbox. This is where you can set if the Hitbox should use
   * Raycast, Blockcast, or Spherecast. There is also additional functionality on
   * `only` adjusting specific segments to use those raycast types.
   */
  SetCastData(castData: CastData): Hitbox;

  /**
   * This callback runs before `HitStart` activates the hitbox.
   * Use OnStopped to clean up these callbacks or alternatively use
   * `Hitbox.Destroy()`.
   */
  BeforeStart(startCallback: StartCallback): Hitbox;

  /**
   * This callback runs per frame while the hitbox exists. Do note that
   * it will still run even if the hitbox is stopped. You can use
   * `Hitbox.Active` to determine if a hitbox is active or not. Use OnStopped
   * to clean up these callbacks or alternatively `Hitbox.Destroy()`.
   */
  OnUpdate(updateCallback: UpdateCallback): Hitbox;

  /**
   * This callback is activated upon the hitbox returning a RaycastResult.
   * Use OnStopped to clean up these callbacks or alternatively `Hitbox.Destroy()`.
   */
  OnHit(hitCallback: HitCallback): Hitbox;

  /**
   * This callback runs after HitStop has activated. Do note that
   * `Hitbox.Destroy()` does not automatically run this function. This callback
   * has a parameter which helps you auto-cleanup every callback used so far.
   * If you don't clean up, you may end up having duplicate callback calls
   * when reusing the hitbox.
   */
  OnStopped(stopCallback: StopCallback): Hitbox;
}

/**
 * Static methods and constructor for ShapecastHitbox
 */
interface ShapecastHitbox {
  /**
   * Creates a new hitbox.
   */
  new (instance: Instance, raycastParams?: RaycastParams): Hitbox;
}

declare enum CastTypes {
  Raycast = "Raycast",
  Blockcast = "Blockcast",
  Spherecast = "Spherecast",
}

declare const ShapecastHitbox: ShapecastHitbox;
export = ShapecastHitbox;
