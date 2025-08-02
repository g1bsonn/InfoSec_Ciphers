from .configs import EnigmaConfig, REFLECTOR_CONFIGS, ROTOR_CONFIGS


class Rotor:
    def __init__(self, wiring: str, notch: str, position: int = 0, ring_setting: int = 0):
        """
        Инициализация ротора
        :param wiring: Проводка (26 букв)
        :param notch: Выемка для срабатывания следующего ротора
        :param position: Начальная позиция (0-25)
        :param ring_setting: Кольцевая настройка (0-25)
        """
        self.wiring = wiring
        self.notch = ord(notch) - ord('A')
        self.position = position
        self.ring_setting = ring_setting
        self.forward_map = self._create_map()
        self.backward_map = self._create_reverse_map()

    def _create_map(self) -> list:
        """Создание прямого отображения контактов"""
        return [ord(char) - ord('A') for char in self.wiring]

    def _create_reverse_map(self) -> list:
        """Создание обратного отображения контактов"""
        reverse_map = [0] * 26
        for i, char in enumerate(self.wiring):
            reverse_map[ord(char) - ord('A')] = i
        return reverse_map

    def rotate(self) -> bool:
        """
        Поворот ротора
        :return: True, если следующий ротор должен повернуться
        """
        self.position = (self.position + 1) % 26
        return self.position == self.notch

    def forward(self, char: int) -> int:
        """Прямое преобразование сигнала"""
        shift = (char + self.position - self.ring_setting) % 26
        result = self.forward_map[shift]
        return (result - self.position + self.ring_setting) % 26

    def backward(self, char: int) -> int:
        """Обратное преобразование сигнала"""
        shift = (char + self.position - self.ring_setting) % 26
        result = self.backward_map[shift]
        return (result - self.position + self.ring_setting) % 26


class Reflector:
    def __init__(self, wiring: str):
        """
        Инициализация рефлектора
        :param wiring: Статическая проводка (13 пар букв)
        """
        self.mapping = [ord(char) - ord('A') for char in wiring]
    
    def reflect(self, char: int) -> int:
        """Отражение сигнала"""
        return self.mapping[char]


class Plugboard:
    def __init__(self, pairs: list):
        """
        Инициализация коммутационной панели
        :param pairs: Список пар соединенных букв (['AB', 'CD'])
        """
        self.mapping = self._create_mapping(pairs)
    
    def _create_mapping(self, pairs: list) -> dict:
        """Создание отображения замены букв"""
        mapping = {}
        for pair in pairs:
            a, b = pair[0].upper(), pair[1].upper()
            a_idx, b_idx = ord(a) - ord('A'), ord(b) - ord('A')
            mapping[a_idx] = b_idx
            mapping[b_idx] = a_idx
        return mapping
    
    def process(self, char: int) -> int:
        """Обработка символа через коммутатор"""
        return self.mapping.get(char, char)


class EnigmaMachine:
    def __init__(self, rotors: list, reflector: Reflector, plugboard: Plugboard):
        """
        Инициализация машины Энигма
        :param rotors: Список роторов [правый, средний, левый]
        :param reflector: Рефлектор
        :param plugboard: Коммутационная панель
        """
        self.rotors = rotors
        self.reflector = reflector
        self.plugboard = plugboard

    def _rotate_rotors(self):
        """Механизм вращения роторов с учетом двойного шага"""
        rotate_next = [True, False, False]  # Флаги для вращения
        
        # Всегда вращаем первый ротор
        if self.rotors[0].rotate():
            rotate_next[1] = True
        
        # Механизм двойного шага для среднего ротора
        if self.rotors[1].position == self.rotors[1].notch:
            rotate_next[1] = True
            rotate_next[2] = True
        
        # Вращение остальных роторов
        for i in range(1, 3):
            if rotate_next[i]:
                self.rotors[i].rotate()

    def _process_char(self, char: str) -> str:
        """Обработка одного символа"""
        if not char.isalpha():
            return char
        
        # Преобразование в числовой индекс (0-25)
        c = ord(char.upper()) - ord('A')
        
        # Вращение роторов перед шифрованием
        self._rotate_rotors()
        
        # Проход через коммутационную панель
        c = self.plugboard.process(c)
        
        # Прямой проход через роторы (справа налево)
        for rotor in self.rotors:
            c = rotor.forward(c)
        
        # Отражение сигнала
        c = self.reflector.reflect(c)
        
        # Обратный проход через роторы (слева направо)
        for rotor in reversed(self.rotors):
            c = rotor.backward(c)
        
        # Проход через коммутационную панель
        c = self.plugboard.process(c)
        
        return chr(c + ord('A'))

    def encrypt(self, text: str) -> str:
        """Шифрование/дешифрование текста"""
        return ''.join(self._process_char(char) for char in text)


def setup_enigma(input: EnigmaConfig) -> EnigmaMachine:
    # 1. Создаем роторы
    rotors = []
    for i, rotor_name in enumerate(input.rotors):
        config = ROTOR_CONFIGS[rotor_name]
        rotor = Rotor(
            wiring=config["wiring"],
            notch=config["notch"],
            position=ord(input.initial_positions[i]) - ord('A'),
            ring_setting=input.ring_settings[i]
        )
        rotors.append(rotor)
    
    # 2. Создаем рефлектор
    reflector_wiring = REFLECTOR_CONFIGS[input.reflector]
    reflector = Reflector(reflector_wiring)
    
    # 3. Создаем коммутационную панель
    plugboard = Plugboard([pair for pair in input.plugboard_pairs])
    
    # 4. Собираем машину Энигмы
    # Порядок роторов: [правый, средний, левый]
    return EnigmaMachine(
        rotors=rotors,
        reflector=reflector,
        plugboard=plugboard
    )
