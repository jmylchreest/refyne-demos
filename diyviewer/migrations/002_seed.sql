-- Seed data for DIY Viewer App
-- Exported from database: 2026-01-24T21:23:35.661Z
-- Tutorial: Simple Animatronic Eyes

-- Tutorial
INSERT OR REPLACE INTO tutorials (id, title, overview, image_url, author, author_url, difficulty, estimated_time, source_url)
VALUES (
  'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab',
  'Simple Animatronic Eyes',
  'Build a realistic eye mechanism for live joystick control or automated projects! This project allows you to create animatronic eyes that can look left, right, up, and down, with eyelids that subtly follow the gaze. A button triggers a rapid blink. The eyes are controlled by an Arduino and can be integrated into larger projects like costumes, robots, or props.',
  'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-11.jpg',
  'Will Cogley',
  'https://makezine.com/author/will-cogley',
  'Moderate',
  '1 Day',
  'https://makezine.com/projects/simple-animatronic-eyes/'
);

-- Glossary
INSERT OR REPLACE INTO glossary (id, tutorial_id, term, definition, context, sort_order) VALUES
  ('47bf9474-1a50-4d90-8267-4ac04af27f98', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Servo', 'A small motor that can be precisely controlled to rotate to a specific angle. Used here to move the eyes and eyelids.', 'SG90 micro servos are used as actuators for the eye and eyelid movements.', 0),
  ('641b5b28-664f-46c1-8834-9ea2c8f74a52', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Arduino', 'An open-source microcontroller platform used for building digital devices and interactive objects. It reads inputs and controls outputs like servos.', 'The Arduino runs the code that interprets joystick and button inputs to control the servos.', 1),
  ('8fa1c80a-ee83-451d-929f-6502cf356fd5', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Servo Driver Board', 'An expansion board that allows a microcontroller like an Arduino to control multiple servos simultaneously, providing power and signal management.', 'A 16-channel servo driver board is used to control the six servos in this project.', 2),
  ('149897c6-b3d1-431f-91a5-ac131588879e', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Potentiometer', 'A variable resistor used to control voltage. Turning its knob changes the resistance, which can be read by a microcontroller to adjust settings.', 'Used to adjust the resting position (openness) of the eyelids.', 3),
  ('d5cd881b-f00e-4e18-9445-6c60faae7718', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Snap-fit', 'A design feature where parts connect by snapping together, often using flexible plastic tabs, without needing screws or glue.', 'The 3D-printed eyes attach to the eye adaptors via a snap-fit mechanism.', 4),
  ('4c11f758-ab2b-4e7d-8673-822dd1317b35', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'M3 Bolt', 'A metric screw with a 3mm diameter. Commonly used in electronics and 3D printing projects for assembly.', 'Used to connect the bases, servo block, and other structural components.', 5),
  ('2afb7a59-c517-4461-abdf-f9dcfb39a7c4', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'M2 Screw', 'A metric screw with a 2mm diameter. Often used for small electronics and servo mounting.', 'Used to attach servos and servo horns.', 6),
  ('601312bf-a92d-4830-aebf-d94903b9a4f1', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Servo Horn', 'An attachment that fits onto a servo''s output shaft, providing a lever arm to connect to other mechanical parts.', 'Used to link the servo motion to the eye and eyelid linkages.', 7),
  ('50bf9143-b4ee-433d-a084-1520dce6f0d5', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Layer Height', 'The thickness of each printed layer in 3D printing. A smaller layer height results in finer detail but longer print time.', 'A 0.2mm layer height is recommended for printing the project parts.', 8),
  ('2afcb88e-c76b-4219-927f-628ad7fb92d2', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Overhang', 'A section of a 3D print that extends outward without direct support from the layer below. Can cause printing issues without supports.', 'The inside of the eyelids may have overhangs, requiring sanding for smooth movement.', 9);

-- Materials
INSERT OR REPLACE INTO materials (id, tutorial_id, name, quantity, notes, measurement_json, sort_order) VALUES
  ('6be5fc8e-a707-4f4b-b76d-39c2818fff2a', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', '3D printer filament', 'As needed', 'PLA is fine, but use a good brand as some parts are small and fragile. ABS is good for realistic eyes but not necessary.', NULL, 0),
  ('559a2d41-3750-4eeb-9a73-5fa675196f10', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Micro servos, SG90', '6', 'TowerPro SG90 or equivalent.', NULL, 1),
  ('0839afc8-38bc-4eb1-9672-74dab5838b99', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Screws, M2 and M3', 'Various', 'Various lengths and head types. Specific sizes mentioned: 4mm, 5mm, 6mm, 8mm, 10mm, 12mm M3 bolts; 4mm, 6mm M2 screws.', NULL, 2),
  ('5aaae41a-886b-42bd-b372-17090920f658', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Arduino microcontroller', '1', 'Uno, Nano, Mega, or similar.', NULL, 3),
  ('8ec22967-1aae-422e-961c-3797b07e59e9', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Servo Driver Board, 16-Channel', '1', 'Adafruit 16-Channel 12-bit Servo Driver or equivalent.', NULL, 4),
  ('1395059d-5b3c-4a2c-b70c-10afda1b2313', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Power supply', '1', 'Around 5V, 4A.', NULL, 5),
  ('87bba496-a4db-4ad2-a508-ce299d1e73df', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Female DC power jack', '1', 'Corresponding to the power supply.', NULL, 6),
  ('140692cf-9361-49a6-96f3-ada2e4b69058', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Joystick, 2-axis', '1', 'Analog joystick module.', NULL, 7),
  ('ed0b0644-2db7-4bf0-8a80-b1ddaf1c3fe5', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Potentiometer', '1 (optional)', 'Linear potentiometer for adjusting eyelid openness.', NULL, 8),
  ('8573f494-b919-41db-9af3-d164bd71a495', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Momentary pushbutton', '1', 'Push-to-make switch for triggering blinks.', NULL, 9),
  ('6efb34e8-eb19-49a6-ab06-80d4203f7f1a', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Resistor, 10kΩ', '1', 'For the potentiometer circuit.', NULL, 10),
  ('1e4e73c0-9c1f-484a-8f83-6b554449d067', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Breadboard jumper wires', 'As needed', 'For connecting components on a breadboard.', NULL, 11),
  ('b99858e8-f214-4e31-aad0-f4b8e75616aa', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Sandpaper', '1 sheet', 'Around 240 grit for smoothing parts.', NULL, 12);

-- Tools
INSERT OR REPLACE INTO tools (id, tutorial_id, name, notes, required, sort_order) VALUES
  ('f0df23b5-9bb8-4cee-bf76-7615bb4aa94e', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', '3D printer', 'Required for printing the parts.', 1, 0),
  ('46958ccd-3f62-4dce-9653-292264f48d6f', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Pin vise hand drill', 'Optional, useful for adjusting hole sizes if using an older/less capable 3D printer.', 0, 1),
  ('59240c02-e0b5-4b1a-a5aa-1798e3c6b5e4', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 'Screwdriver(s)', 'To match the screws used (Phillips or flathead as needed).', 1, 2);

-- Steps
INSERT OR REPLACE INTO steps (id, tutorial_id, step_number, title, instructions, tips, measurements_json) VALUES
  ('1bea21d7-39d6-46a1-8f78-2b325e910ee7', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 1, 'Printing', 'Download the files for printing from the provided link. Print the parts with a healthy printer; no supports should be needed. Use a stronger material like ASA or PETG for thin sections and snap-fits, but PLA works. Use a 0.2mm layer height. The eyes come in options: blank round, iris/pupil cutout, or a highly realistic version. They attach via snap-fit to the eye adaptors. Ensure the eyes are 32mm diameter or less. Sand the inside of the eyelids if needed due to overhangs. Some holes are undersized for direct screwing; others are oversized for rotation. Adjust hole sizes with a drill if your printer isn''t accurate.', 'Test fit parts as you go. Ensure smooth movement by sanding or drilling as necessary.', '[{"original":"0.2mm","metric":"0.2 mm","imperial":"0.0079 in"},{"original":"32mm","metric":"32 mm","imperial":"1.26 in"}]'),
  ('fb0b3eec-f66b-4a4a-bd40-7890ce390342', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 2, 'Assembly', '1. Connect the two bases with 10mm or 12mm M3 bolts. This pivot is for y-axis motion and eyelids.
2. Place the servo in position and screw it in with 4mm or 6mm M2 screws (x-axis actuator).
3. Attach the y-axis arm to the sub-base with a 4/5/6mm M3 screw, and attach a servo horn on the third hole from the center using a 4mm or 6mm M2 screw. Check orientation.
4. Start the x-axis assembly by screwing the forks into the eye-adaptors with 4/5/6mm M3 bolts. The fork holes should be oversized so screws bite into the adaptor.
5. Attach the three-point connector to the top of the forks; the M3 screw will bite into the undersized hole. Attach a servo arm to the center of the three-point connector using a 5mm M3 bolt (drill the servo arm hole to 2.5mm–2.8mm if needed).
6. Attach the eye center-link to the eye adaptors with an 8mm M3 screw, ensuring the flat surface faces up and the sloping section faces down. Plug in the eyes.
7. Screw this assembly to the center of the sub-base with two 12mm M3 bolts.
8. Load the servo block with five TowerPro SG90 servos in the correct orientation. Attach it to the base with four M3×10mm bolts.
9. Identify eyelids using the photo. Connect the relevant connector with a 4mm or 6mm M2 screw, and attach a servo arm to the other end using the last hole in the servo horn (drill to 1.5mm–1.8mm if needed).
10. Attach the eyelids to the base, but don''t connect servo horns yet.', 'Manipulate the assembly regularly during build to ensure smooth movement without friction.', '[{"original":"10mm or 12mm M3 bolts","metric":"10-12 mm M3 bolts","imperial":"0.39-0.47 in M3 bolts"},{"original":"4mm or 6mm M2 screws","metric":"4-6 mm M2 screws","imperial":"0.16-0.24 in M2 screws"},{"original":"4/5/6mm M3 screw","metric":"4-6 mm M3 screw","imperial":"0.16-0.24 in M3 screw"},{"original":"8mm M3 screw","metric":"8 mm M3 screw","imperial":"0.31 in M3 screw"},{"original":"12mm M3 bolts","metric":"12 mm M3 bolts","imperial":"0.47 in M3 bolts"},{"original":"M3×10mm bolts","metric":"10 mm M3 bolts","imperial":"0.39 in M3 bolts"},{"original":"5mm M3 bolt","metric":"5 mm M3 bolt","imperial":"0.20 in M3 bolt"},{"original":"1.5mm–1.8mm","metric":"1.5-1.8 mm","imperial":"0.059-0.071 in"},{"original":"2.5mm–2.8mm","metric":"2.5-2.8 mm","imperial":"0.098-0.110 in"}]'),
  ('0dd2dcf0-f909-4fae-8d0f-f3e18baa36c8', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 3, 'Wiring, Code, and Finishing Up', '1. Upload the code to the Arduino. Wire everything up. Refer to the Adafruit guide for setting up the servo driver board if needed. Download the Adafruit Servo Driver Arduino library.
2. All servos should now be powered and in their neutral position. Link all servo arms to the servos with the eyes facing straight forward. You can plug them in while powered, then disconnect power to screw them in properly. The y-axis servo arm position may be awkward; if it doesn''t hold, consider removing an eyelid servo to screw it in.
3. Test motion with the joystick to ensure no issues.
4. For eyelids, attach the servo arms while they''re in the blinking position to align all four in the center. Do this by holding down the blink switch or creating a short circuit over it. Once aligned, pop a screw in to secure them.', 'Testing at this stage helps catch any mechanical issues before final assembly.', NULL),
  ('d1fb33c1-1c45-4cc3-ab37-306b8d89e755', 'f9bb3e6a-c97d-452f-b779-de5a1f10c1ab', 4, 'Operation and Integration', 'Your model is complete! Use the joystick to control eye direction; eyelids move subtly with the gaze. Press the button for a rapid blink. The potentiometer adjusts eyelid openness at rest for a sleepy or alert look. To integrate into larger projects, swap joystick, potentiometer, and button inputs for signal cables from your controller. Control direction with analog signals through pins A0/A1, openness from A2, and send a high/low digital signal for blink.', 'There are extra pins on the Arduino and driver board to add more animatronic parts.', NULL);

-- Step Images
INSERT OR REPLACE INTO step_images (id, step_id, image_url, sort_order) VALUES
  ('a55f558f-d75b-490a-bf47-43b657efff96', '0dd2dcf0-f909-4fae-8d0f-f3e18baa36c8', 'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-13-750x542.jpg', 0),
  ('054db380-cfa2-404e-bfd8-087bfc03699f', 'fb0b3eec-f66b-4a4a-bd40-7890ce390342', 'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-15-750x500.jpg', 0),
  ('062d7840-4d8d-4c42-9c3a-aef688fc7cb3', 'fb0b3eec-f66b-4a4a-bd40-7890ce390342', 'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-14-750x500.jpg', 1),
  ('fd81b7c5-9011-4fb8-a614-6a426ea690d3', 'fb0b3eec-f66b-4a4a-bd40-7890ce390342', 'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-17-750x500.jpg', 2),
  ('864a2870-25d2-471c-b174-798eaafe8c74', 'fb0b3eec-f66b-4a4a-bd40-7890ce390342', 'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-16-750x500.jpg', 3),
  ('4bd9edb0-8f4b-4a5a-84e2-35d4ebf4d9a7', 'fb0b3eec-f66b-4a4a-bd40-7890ce390342', 'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-18-750x500.jpg', 4),
  ('6ec58db0-c7a8-490f-9760-dfa9535c6ca1', 'fb0b3eec-f66b-4a4a-bd40-7890ce390342', 'https://makezine.com/wp-content/uploads/2025/10/Animatronic-Eyes-19-750x500.jpg', 5);

